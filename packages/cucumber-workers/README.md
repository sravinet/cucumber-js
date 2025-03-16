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
  worldParameters?: Record<string, any>;
  runtime?: {
    dryRun?: boolean;
    failFast?: boolean;
  };
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

Formats test results for display.

```typescript
const formatter = new BasicFormatter({ colors: true, showSteps: true });
formatter.start();
// Run tests
formatter.end();
```

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