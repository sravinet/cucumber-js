# Cucumber Workers API Reference

## Core API

Cucumber Workers provides a familiar API that closely resembles Cucumber.js while being optimized for the Cloudflare Workers environment.

### Step Definition Functions

```typescript
import { Given, When, Then } from '@cucumber/cucumber-workers';

Given(pattern: string | RegExp, fn: StepDefinitionFunction): void
When(pattern: string | RegExp, fn: StepDefinitionFunction): void
Then(pattern: string | RegExp, fn: StepDefinitionFunction): void
```

These functions register step definitions that match Gherkin steps in your feature files. The pattern can be a string using Cucumber Expressions or a regular expression.

Example:
```typescript
import { Given, When, Then } from '@cucumber/cucumber-workers';

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
```

### Hooks

```typescript
import { Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber-workers';

Before(options?: HookOptions, fn?: HookFunction): void
After(options?: HookOptions, fn?: HookFunction): void
BeforeAll(options?: HookOptions, fn?: HookFunction): void
AfterAll(options?: HookOptions, fn?: HookFunction): void
```

Hooks allow you to run code before or after scenarios and features. They can be tagged to run only for specific scenarios.

Example:
```typescript
import { Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber-workers';

// Run before each scenario
Before(function() {
  this.reset();
});

// Run before scenarios with @database tag
Before({ tags: '@database' }, function() {
  this.setupDatabase();
});

// Run after each scenario
After(function() {
  this.cleanup();
});

// Run once before all scenarios
BeforeAll(function() {
  console.log('Starting test run');
});

// Run once after all scenarios
AfterAll(function() {
  console.log('Test run complete');
});
```

### Parameter Types

```typescript
import { defineParameterType } from '@cucumber/cucumber-workers';

defineParameterType({
  name: string,
  regexp: RegExp | RegExp[],
  transformer: (...args: string[]) => any,
  useForSnippets?: boolean,
  preferForRegexpMatch?: boolean
}): void
```

Parameter types allow you to define custom transformations for parameters in step definitions.

Example:
```typescript
import { defineParameterType } from '@cucumber/cucumber-workers';

defineParameterType({
  name: 'color',
  regexp: /red|green|blue/,
  transformer: (color) => ({ red: '#FF0000', green: '#00FF00', blue: '#0000FF' }[color])
});

Given('I have a {color} ball', function(color) {
  // color will be the hex code, e.g., '#FF0000' for 'red'
  this.ballColor = color;
});
```

### Data Tables

Data tables in Gherkin are transformed into `DataTable` objects in step definitions.

```typescript
class DataTable {
  raw(): string[][]
  rows(): string[][]
  rowsHash(): Record<string, string>
  hashes(): Record<string, string>[]
  transpose(): DataTable
  cell(row: number, col: number): string
}
```

Example:
```typescript
Given('the following users exist:', function(dataTable) {
  const users = dataTable.hashes();
  for (const user of users) {
    this.addUser(user.name, user.email, user.role);
  }
});
```

With a Gherkin table like:
```gherkin
Given the following users exist:
  | name  | email           | role     |
  | Alice | alice@test.com  | admin    |
  | Bob   | bob@test.com    | user     |
```

## Vitest Integration

### Creating Cucumber Tests in Vitest

```typescript
import { createCucumberTest } from '@cucumber/cucumber-workers';

createCucumberTest(
  testFn: Function,
  options: {
    name?: string,
    features: Feature[] | string[],
    tagExpression?: string,
    formatters?: FormatterOptions[],
    worldParameters?: Record<string, any>
  }
): void
```

Example:
```typescript
import { test } from 'vitest';
import { createCucumberTest } from '@cucumber/cucumber-workers';
import calculatorFeature from './features/calculator.feature';

createCucumberTest(test, {
  name: 'Calculator features',
  features: [calculatorFeature],
  tagExpression: '@smoke and not @slow',
  worldParameters: { baseUrl: 'https://example.com' }
});
```

## Formatters

Cucumber Workers provides several formatters for different output formats:

### Basic Formatter

```typescript
import { BasicFormatter } from '@cucumber/cucumber-workers/formatters';

new BasicFormatter(options?: {
  colorEnabled?: boolean
})
```

### Progress Formatter

```typescript
import { ProgressFormatter } from '@cucumber/cucumber-workers/formatters';

new ProgressFormatter(options?: {
  colorEnabled?: boolean
})
```

### Summary Formatter

```typescript
import { SummaryFormatter } from '@cucumber/cucumber-workers/formatters';

new SummaryFormatter(options?: {
  colorEnabled?: boolean
})
```

### JSON Formatter

```typescript
import { JsonFormatter } from '@cucumber/cucumber-workers/formatters';

new JsonFormatter(options?: {
  outputFile?: string
})
```

Example with multiple formatters:
```typescript
createCucumberTest(test, {
  name: 'Calculator features',
  features: [calculatorFeature],
  formatters: [
    { type: 'progress', colorEnabled: true },
    { type: 'json', outputFile: 'cucumber-report.json' }
  ]
});
```

## Vite Plugin

```typescript
import { cucumberWorkersPlugin } from '@cucumber/cucumber-workers/vite-plugin';

cucumberWorkersPlugin(options?: {
  include?: string | string[],
  exclude?: string | string[]
})
```

Example in vite.config.ts:
```typescript
import { defineConfig } from 'vite';
import { cucumberWorkersPlugin } from '@cucumber/cucumber-workers/vite-plugin';

export default defineConfig({
  plugins: [
    cucumberWorkersPlugin({
      include: 'features/**/*.feature'
    })
  ]
});
```

## Types

### Feature

```typescript
interface Feature {
  path: string;
  content: string;
}
```

### HookOptions

```typescript
interface HookOptions {
  tags?: string;
  timeout?: number;
}
```

### FormatterOptions

```typescript
interface FormatterOptions {
  type: 'basic' | 'progress' | 'summary' | 'json';
  colorEnabled?: boolean;
  outputFile?: string;
}
```

### StepDefinitionFunction

```typescript
type StepDefinitionFunction = (this: World, ...args: any[]) => any | Promise<any>;
```

### HookFunction

```typescript
type HookFunction = (this: World) => any | Promise<any>;
```

### World

```typescript
interface World {
  [key: string]: any;
  attach(data: string | Buffer, mimeType?: string): void;
  log(text: string): void;
  parameters: Record<string, any>;
}
``` 