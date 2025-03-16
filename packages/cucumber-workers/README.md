# Cucumber Workers

A specialized version of Cucumber.js that is fully compatible with Cloudflare Workers, leveraging both `@cloudflare/vitest-pool-workers` for test execution and `@cloudflare/vite-plugin` for development workflow.

## Overview

Cucumber Workers enables developers to write and run Behavior-Driven Development (BDD) tests directly in the Cloudflare Workers environment, maintaining the familiar Gherkin syntax while working within the constraints of the Workers platform.

## Installation

```bash
npm install --save-dev @cucumber/cucumber-workers
```

## Key Features

- **Workers-Compatible**: Designed specifically for the Cloudflare Workers runtime
- **Vitest Integration**: Seamless integration with Vitest and vitest-pool-workers
- **Familiar API**: Uses the same Gherkin syntax and step definition patterns as Cucumber.js
- **In-Memory Feature Files**: Support for both file-based and in-memory feature files
- **Optimized for Workers**: Works within the constraints of the Workers environment
- **Source Mapping**: Maps error stack traces back to feature files for better debugging
- **Multiple Formatters**: Support for various output formats (JSON, Progress, Summary)

## Usage

### Basic Example

```typescript
// test/cucumber.test.ts
import { describe, it } from 'vitest';
import { createCucumberTest } from '@cucumber/cucumber-workers/vitest';
import { Given, When, Then } from '@cucumber/cucumber-workers';

// Define step definitions
Given('I have {int} cucumbers', function(count) {
  this.cucumberCount = count;
});

When('I eat {int} cucumbers', function(count) {
  this.cucumberCount -= count;
});

Then('I should have {int} cucumbers left', function(count) {
  if (this.cucumberCount !== count) {
    throw new Error(`Expected ${count} cucumbers, but had ${this.cucumberCount}`);
  }
});

// Define an in-memory feature file
const featureContent = `
Feature: Eating cucumbers
  As a cucumber enthusiast
  I want to track my cucumber consumption
  So that I don't run out of cucumbers

  Scenario: Eating some cucumbers
    Given I have 10 cucumbers
    When I eat 3 cucumbers
    Then I should have 7 cucumbers left
`;

// Create a test suite
describe('Cucumber Tests', () => {
  createCucumberTest(it, {
    name: 'should run cucumber scenarios',
    features: [
      {
        path: 'features/eating_cucumbers.feature',
        content: featureContent
      }
    ],
    worldParameters: {
      debug: true
    }
  });
});
```

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { cloudflare } from '@cloudflare/vite-plugin';

export default defineConfig({
  plugins: [
    cloudflare()
  ],
  test: {
    environment: 'node',
    pool: '@cloudflare/vitest-pool-workers',
    poolOptions: {
      workers: {
        // Workers-specific configuration
      }
    }
  }
});
```

## API Reference

### Step Definition Functions

```typescript
Given(pattern: string | RegExp, fn: Function): void
When(pattern: string | RegExp, fn: Function): void
Then(pattern: string | RegExp, fn: Function): void
```

### Custom Parameter Types

```typescript
defineParameterType({
  name: string,
  regexp: RegExp,
  transformer: (s: string) => any
}): void
```

### Creating Tests

```typescript
createCucumberTest(
  testFn: (name: string, fn: () => Promise<void>) => void,
  options: CucumberTestOptions
): void
```

### CucumberTestOptions

```typescript
interface CucumberTestOptions {
  name: string;
  features: (string | FeatureFile)[];
  tagExpression?: string;
  worldParameters?: Record<string, any>;
  runtime?: {
    dryRun?: boolean;
    failFast?: boolean;
  };
  formatters?: FormatterConfig[];
}
```

### FormatterConfig

```typescript
interface FormatterConfig {
  type: 'basic' | 'json' | 'progress' | 'summary';
  formatter?: BasicFormatter | JsonFormatter | ProgressFormatter | SummaryFormatter;
  outputFile?: string;
  options?: Record<string, any>;
}
```

### Feature File Interface

```typescript
interface FeatureFile {
  path: string;
  content: string;
}
```

## Core Components

### WorkersFeatureLoader

Manages feature files in memory for the Workers environment.

```typescript
const featureLoader = new WorkersFeatureLoader();
featureLoader.register('features/my.feature', featureContent);
```

### WorkersStepRegistry

Registers and manages step definitions.

```typescript
const registry = new WorkersStepRegistry();
registry.register('I have {int} cucumbers', function(count) {
  // Step implementation
});
```

### BasicFormatter

Formats test results for display with detailed output.

```typescript
const formatter = new BasicFormatter({ colors: true, showSteps: true });
formatter.start();
// Run tests
formatter.end();
```

### ProgressFormatter

Formats test results with minimal output, showing progress as tests run.

```typescript
const formatter = new ProgressFormatter({ colors: true });
formatter.start();
// Run tests
formatter.end();
```

### SummaryFormatter

Formats test results with a detailed summary at the end of the test run, without showing progress during execution.

```typescript
const formatter = new SummaryFormatter({ 
  colors: true,
  showFailedSteps: true,
  showUndefinedSteps: true,
  showPendingSteps: true
});
formatter.start();
// Run tests
formatter.end();
```

### JsonFormatter

Formats test results as JSON for integration with reporting tools.

```typescript
const formatter = new JsonFormatter({ 
  includeSource: false, 
  includeAttachments: true 
});
formatter.start();
// Run tests
formatter.end();
```

## Formatters in Test Configuration

You can specify formatters in your test configuration:

```typescript
createCucumberTest(test, {
  name: 'My Cucumber Test',
  features: [/* ... */],
  formatters: [
    { type: 'basic' },                // Use the basic formatter
    { type: 'progress' },             // Use the progress formatter
    { type: 'summary' },              // Use the summary formatter
    { type: 'json', outputFile: 'cucumber-report.json' } // Output JSON to a file
  ]
});
```

Or use custom formatter instances:

```typescript
const customFormatter = new ProgressFormatter({ colors: true });

createCucumberTest(test, {
  name: 'My Cucumber Test',
  features: [/* ... */],
  formatters: [
    { type: 'progress', formatter: customFormatter }
  ]
});
```

## Source Mapping

Cucumber Workers includes source mapping for error stack traces, which maps error locations back to feature files and step definitions for better debugging.

### Enabling Source Mapping

Source mapping is enabled by default, but you can explicitly configure it in your test file:

```typescript
createCucumberTest(test, {
  name: 'My Cucumber Test',
  features: [/* ... */],
  runtime: {
    useSourceMaps: true // Enable source mapping (default is true)
  },
  sourceMaps: {
    includeSourceContent: true, // Include source code snippets (default is true)
    filterStackTraces: true // Filter out irrelevant stack frames (default is true)
  }
});
```

### Example Error Output

With source mapping enabled, error stack traces will include the original source locations:

```
Error: Expected result to be 120, but got 120
    at Then (features/calculator.feature:10:5)
        Then the result should be 120 on the screen
        ^
    at Object.<anonymous> (step-definitions/calculator-steps.ts:30:11)
        throw new Error(`Expected result to be ${expectedResult}, but got ${calculator.result}`);
              ^
```

For more information, see the [source mapping documentation](./docs/source-mapping.md).

## Development Workflow

1. **Setup**: Install dependencies and configure Vite
2. **Write Features**: Create feature files using Gherkin syntax
3. **Implement Steps**: Write step definitions using the Cucumber Workers API
4. **Run Tests**: Execute tests using Vitest
5. **View Results**: Review test results in the console or CI environment

## Limitations

- Workers environment constraints apply (memory limits, execution time, etc.)
- Some advanced Cucumber.js features may not be available
- File system access is limited to build-time processing

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 