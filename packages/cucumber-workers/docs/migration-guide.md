# Migrating from Cucumber.js to Cucumber Workers

This guide helps you migrate your existing Cucumber.js tests to Cucumber Workers for running in the Cloudflare Workers environment.

## Key Differences

Cucumber Workers is designed specifically for the Cloudflare Workers environment, which has some important constraints compared to Node.js:

1. **No direct file system access**: Feature files must be processed at build time
2. **Limited memory**: Tests must be optimized for memory usage
3. **Execution time limits**: Tests must complete within the Workers time limits
4. **Different runtime environment**: Some Node.js APIs are not available

## Migration Steps

### 1. Project Setup

First, set up your project with the necessary dependencies:

```bash
npm install --save-dev @cucumber/cucumber-workers vitest @cloudflare/vitest-pool-workers
```

Update your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import { cucumberWorkersPlugin } from '@cucumber/cucumber-workers/vite-plugin';

export default defineConfig({
  plugins: [
    cucumberWorkersPlugin({
      include: 'features/**/*.feature'
    })
  ],
  test: {
    pool: 'workers'
  }
});
```

### 2. Feature Files

Your feature files can remain largely unchanged. However, instead of loading them from the file system at runtime, they need to be imported as modules:

**Before (Cucumber.js):**
```javascript
// cucumber.js configuration
module.exports = {
  paths: ['features/**/*.feature']
};
```

**After (Cucumber Workers):**
```typescript
// Import feature files directly
import calculatorFeature from './features/calculator.feature';
import userFeature from './features/user.feature';

// Use them in your tests
createCucumberTest(test, {
  name: 'All features',
  features: [calculatorFeature, userFeature]
});
```

### 3. Step Definitions

Step definitions have a similar API but need to be imported differently:

**Before (Cucumber.js):**
```javascript
const { Given, When, Then } = require('@cucumber/cucumber');

Given('I have {int} cucumbers', function(count) {
  this.cucumberCount = count;
});
```

**After (Cucumber Workers):**
```typescript
import { Given, When, Then } from '@cucumber/cucumber-workers';

Given('I have {int} cucumbers', function(count) {
  this.cucumberCount = count;
});
```

### 4. Hooks

Hooks work similarly but with some differences in options:

**Before (Cucumber.js):**
```javascript
const { Before, After } = require('@cucumber/cucumber');

Before(function() {
  // Setup code
});

Before('@database', function() {
  // Setup for database scenarios
});
```

**After (Cucumber Workers):**
```typescript
import { Before, After } from '@cucumber/cucumber-workers';

Before(function() {
  // Setup code
});

Before({ tags: '@database' }, function() {
  // Setup for database scenarios
});
```

### 5. World Parameters

World parameters are passed differently:

**Before (Cucumber.js):**
```javascript
// cucumber.js configuration
module.exports = {
  worldParameters: {
    baseUrl: 'https://example.com'
  }
};
```

**After (Cucumber Workers):**
```typescript
createCucumberTest(test, {
  name: 'All features',
  features: [calculatorFeature],
  worldParameters: {
    baseUrl: 'https://example.com'
  }
});
```

### 6. Formatters

Formatters are configured differently:

**Before (Cucumber.js):**
```javascript
// cucumber.js configuration
module.exports = {
  format: ['progress', 'json:cucumber-report.json']
};
```

**After (Cucumber Workers):**
```typescript
createCucumberTest(test, {
  name: 'All features',
  features: [calculatorFeature],
  formatters: [
    { type: 'progress' },
    { type: 'json', outputFile: 'cucumber-report.json' }
  ]
});
```

### 7. Tag Expressions

Tag expressions work similarly:

**Before (Cucumber.js):**
```javascript
// cucumber.js configuration
module.exports = {
  tags: '@smoke and not @slow'
};
```

**After (Cucumber Workers):**
```typescript
createCucumberTest(test, {
  name: 'All features',
  features: [calculatorFeature],
  tagExpression: '@smoke and not @slow'
});
```

## Unsupported Features

Some Cucumber.js features are not currently supported in Cucumber Workers:

1. **Custom Formatters**: Only the built-in formatters are supported
2. **Parallel Execution**: Limited parallel execution support
3. **Custom Parameter Type Transformers**: Limited support for complex transformers
4. **File System Operations**: No direct file system access in step definitions

## Workarounds for Common Issues

### File System Access

Instead of reading files in your step definitions, consider:
- Including test data in your feature files using data tables
- Using world parameters to pass configuration
- Mocking file system operations

Example:
```typescript
// Instead of reading a file
Given('a user from {string}', function(filePath) {
  // Don't do this - no file system access
  // const userData = fs.readFileSync(filePath, 'utf8');
  
  // Instead, use data tables or world parameters
  const userData = this.parameters.testUsers[filePath];
  this.user = JSON.parse(userData);
});
```

### Network Requests

Use the Fetch API instead of Node.js-specific libraries:

```typescript
// Instead of using axios or request
When('I make a request to {string}', async function(url) {
  // Don't do this - Node.js specific
  // const response = await axios.get(url);
  
  // Instead, use fetch
  const response = await fetch(url);
  this.responseData = await response.json();
});
```

### Timeouts

Workers have execution time limits, so optimize your tests:

```typescript
// Set shorter timeouts
Before({ timeout: 5000 }, function() {
  // This hook must complete within 5 seconds
});
```

## Best Practices

1. **Keep tests small and focused**: Break large test suites into smaller ones
2. **Minimize memory usage**: Avoid creating large objects or arrays
3. **Use build-time processing**: Move complex processing to build time
4. **Leverage Vitest integration**: Use Vitest's features for better test organization
5. **Use tags effectively**: Organize tests with tags for selective execution

## Example Migration

### Before (Cucumber.js)

```javascript
// features/calculator.feature
Feature: Calculator
  Scenario: Addition
    Given I have entered 5 into the calculator
    And I have entered 7 into the calculator
    When I press add
    Then the result should be 12 on the screen

// features/step_definitions/calculator_steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const Calculator = require('../../src/calculator');

Given('I have entered {int} into the calculator', function(number) {
  if (!this.calculator) {
    this.calculator = new Calculator();
  }
  this.calculator.enter(number);
});

When('I press add', function() {
  this.calculator.add();
});

Then('the result should be {int} on the screen', function(expectedResult) {
  assert.strictEqual(this.calculator.getResult(), expectedResult);
});

// cucumber.js
module.exports = {
  paths: ['features/**/*.feature'],
  require: ['features/step_definitions/**/*.js'],
  format: ['progress']
};
```

### After (Cucumber Workers)

```typescript
// features/calculator.feature (unchanged)
Feature: Calculator
  Scenario: Addition
    Given I have entered 5 into the calculator
    And I have entered 7 into the calculator
    When I press add
    Then the result should be 12 on the screen

// features/step_definitions/calculator_steps.ts
import { Given, When, Then } from '@cucumber/cucumber-workers';
import { Calculator } from '../../src/calculator';

Given('I have entered {int} into the calculator', function(number) {
  if (!this.calculator) {
    this.calculator = new Calculator();
  }
  this.calculator.enter(number);
});

When('I press add', function() {
  this.calculator.add();
});

Then('the result should be {int} on the screen', function(expectedResult) {
  if (this.calculator.getResult() !== expectedResult) {
    throw new Error(`Expected ${expectedResult}, but got ${this.calculator.getResult()}`);
  }
});

// cucumber.test.ts
import { test } from 'vitest';
import { createCucumberTest } from '@cucumber/cucumber-workers';
import calculatorFeature from './features/calculator.feature';

createCucumberTest(test, {
  name: 'Calculator features',
  features: [calculatorFeature],
  formatters: [{ type: 'progress' }]
});

// vite.config.ts
import { defineConfig } from 'vite';
import { cucumberWorkersPlugin } from '@cucumber/cucumber-workers/vite-plugin';

export default defineConfig({
  plugins: [
    cucumberWorkersPlugin({
      include: 'features/**/*.feature'
    })
  ],
  test: {
    pool: 'workers'
  }
});
``` 