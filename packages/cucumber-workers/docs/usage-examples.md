# Cucumber Workers Usage Examples

This document provides comprehensive examples of how to use Cucumber Workers in different scenarios.

## Basic Usage

### Simple Feature Test

```typescript
// features/calculator.feature
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

// calculator.test.ts
import { test } from 'vitest';
import { createCucumberTest } from '@cucumber/cucumber-workers';
import calculatorFeature from './features/calculator.feature';

createCucumberTest(test, {
  name: 'Calculator features',
  features: [calculatorFeature]
});
```

## Advanced Features

### Using Tags

```typescript
// features/calculator.feature
Feature: Calculator

  @smoke
  Scenario: Addition
    Given I have entered 5 into the calculator
    And I have entered 7 into the calculator
    When I press add
    Then the result should be 12 on the screen

  @regression @slow
  Scenario: Division
    Given I have entered 10 into the calculator
    And I have entered 2 into the calculator
    When I press divide
    Then the result should be 5 on the screen

// calculator.test.ts
import { test } from 'vitest';
import { createCucumberTest } from '@cucumber/cucumber-workers';
import calculatorFeature from './features/calculator.feature';

// Run only smoke tests
createCucumberTest(test, {
  name: 'Smoke tests',
  features: [calculatorFeature],
  tagExpression: '@smoke'
});

// Run regression tests that are not slow
createCucumberTest(test, {
  name: 'Fast regression tests',
  features: [calculatorFeature],
  tagExpression: '@regression and not @slow'
});
```

### Using Hooks

```typescript
// features/support/hooks.ts
import { Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber-workers';
import { setupTestDatabase, cleanupTestDatabase } from './test-helpers';

// Run before all scenarios
BeforeAll(function() {
  console.log('Starting test run');
});

// Run after all scenarios
AfterAll(function() {
  console.log('Test run complete');
});

// Run before each scenario
Before(function() {
  this.calculator = new Calculator();
  console.log('Setting up calculator');
});

// Run before scenarios with @database tag
Before({ tags: '@database' }, async function() {
  this.databaseId = await setupTestDatabase();
  console.log(`Set up test database: ${this.databaseId}`);
});

// Run after scenarios with @database tag
After({ tags: '@database' }, async function() {
  await cleanupTestDatabase(this.databaseId);
  console.log(`Cleaned up test database: ${this.databaseId}`);
});

// Run after each scenario
After(function() {
  console.log('Cleaning up calculator');
  delete this.calculator;
});
```

### Using Data Tables

```typescript
// features/users.feature
Feature: User Management

  Scenario: Adding multiple users
    Given the following users exist:
      | name  | email           | role     |
      | Alice | alice@test.com  | admin    |
      | Bob   | bob@test.com    | user     |
      | Carol | carol@test.com  | user     |
    When I list all users
    Then I should see 3 users
    And "Alice" should have the "admin" role

// features/step_definitions/user_steps.ts
import { Given, When, Then } from '@cucumber/cucumber-workers';
import { UserManager } from '../../src/user-manager';

Given('the following users exist:', function(dataTable) {
  this.userManager = new UserManager();
  
  // Using hashes() to get an array of objects
  const users = dataTable.hashes();
  for (const user of users) {
    this.userManager.addUser(user.name, user.email, user.role);
  }
});

When('I list all users', function() {
  this.userList = this.userManager.listUsers();
});

Then('I should see {int} users', function(count) {
  if (this.userList.length !== count) {
    throw new Error(`Expected ${count} users, but got ${this.userList.length}`);
  }
});

Then('{string} should have the {string} role', function(name, role) {
  const user = this.userList.find(u => u.name === name);
  if (!user) {
    throw new Error(`User ${name} not found`);
  }
  if (user.role !== role) {
    throw new Error(`Expected ${name} to have role ${role}, but got ${user.role}`);
  }
});
```

### Using Scenario Outlines

```typescript
// features/calculator.feature
Feature: Calculator

  Scenario Outline: Basic operations
    Given I have entered <first> into the calculator
    And I have entered <second> into the calculator
    When I press <operation>
    Then the result should be <result> on the screen

    Examples:
      | first | second | operation | result |
      | 5     | 7      | add       | 12     |
      | 10    | 2      | subtract  | 8      |
      | 3     | 4      | multiply  | 12     |
      | 10    | 2      | divide    | 5      |

// features/step_definitions/calculator_steps.ts
import { Given, When, Then } from '@cucumber/cucumber-workers';
import { Calculator } from '../../src/calculator';

Given('I have entered {int} into the calculator', function(number) {
  if (!this.calculator) {
    this.calculator = new Calculator();
  }
  this.calculator.enter(number);
});

When('I press {word}', function(operation) {
  switch (operation) {
    case 'add':
      this.calculator.add();
      break;
    case 'subtract':
      this.calculator.subtract();
      break;
    case 'multiply':
      this.calculator.multiply();
      break;
    case 'divide':
      this.calculator.divide();
      break;
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
});

Then('the result should be {int} on the screen', function(expectedResult) {
  if (this.calculator.getResult() !== expectedResult) {
    throw new Error(`Expected ${expectedResult}, but got ${this.calculator.getResult()}`);
  }
});
```

## Multiple Formatters

```typescript
// calculator.test.ts
import { test } from 'vitest';
import { createCucumberTest } from '@cucumber/cucumber-workers';
import calculatorFeature from './features/calculator.feature';

createCucumberTest(test, {
  name: 'Calculator features',
  features: [calculatorFeature],
  formatters: [
    { type: 'progress', colorEnabled: true },
    { type: 'summary' },
    { type: 'json', outputFile: 'cucumber-report.json' }
  ]
});
```

## Custom Parameter Types

```typescript
// features/support/parameter-types.ts
import { defineParameterType } from '@cucumber/cucumber-workers';

defineParameterType({
  name: 'color',
  regexp: /red|green|blue/,
  transformer: (color) => ({ red: '#FF0000', green: '#00FF00', blue: '#0000FF' }[color])
});

// features/step_definitions/color_steps.ts
import { Given, When, Then } from '@cucumber/cucumber-workers';

Given('I have a {color} ball', function(color) {
  this.ballColor = color;
});

Then('the ball should be {string}', function(hexCode) {
  if (this.ballColor !== hexCode) {
    throw new Error(`Expected color ${hexCode}, but got ${this.ballColor}`);
  }
});

// features/colors.feature
Feature: Colors

  Scenario: Color conversion
    Given I have a red ball
    Then the ball should be "#FF0000"
```

## World Parameters

```typescript
// calculator.test.ts
import { test } from 'vitest';
import { createCucumberTest } from '@cucumber/cucumber-workers';
import calculatorFeature from './features/calculator.feature';

createCucumberTest(test, {
  name: 'Calculator features',
  features: [calculatorFeature],
  worldParameters: {
    baseUrl: 'https://example.com',
    apiKey: 'test-api-key',
    testMode: true
  }
});

// features/step_definitions/api_steps.ts
import { Given, When, Then } from '@cucumber/cucumber-workers';

When('I make an API request', async function() {
  const { baseUrl, apiKey } = this.parameters;
  
  const response = await fetch(`${baseUrl}/api`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });
  
  this.responseData = await response.json();
});
```

## Multiple Feature Files

```typescript
// calculator.test.ts
import { test } from 'vitest';
import { createCucumberTest } from '@cucumber/cucumber-workers';
import calculatorFeature from './features/calculator.feature';
import userFeature from './features/users.feature';
import colorFeature from './features/colors.feature';

// Run all features in one test
createCucumberTest(test, {
  name: 'All features',
  features: [calculatorFeature, userFeature, colorFeature]
});

// Or run them separately
createCucumberTest(test, {
  name: 'Calculator features',
  features: [calculatorFeature]
});

createCucumberTest(test, {
  name: 'User features',
  features: [userFeature]
});

createCucumberTest(test, {
  name: 'Color features',
  features: [colorFeature]
});
```

## Error Handling

```typescript
// features/step_definitions/error_steps.ts
import { Given, When, Then } from '@cucumber/cucumber-workers';

Given('a step that will fail', function() {
  throw new Error('This step intentionally fails');
});

When('a step with an assertion error', function() {
  const actual = 5;
  const expected = 10;
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, but got ${actual}`);
  }
});

// The error will be reported with source mapping and context information
```

## Vite Plugin Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { cucumberWorkersPlugin } from '@cucumber/cucumber-workers/vite-plugin';

export default defineConfig({
  plugins: [
    cucumberWorkersPlugin({
      // Include only specific feature files
      include: 'features/**/*.feature',
      
      // Exclude certain feature files
      exclude: 'features/wip/**/*.feature'
    })
  ],
  test: {
    pool: 'workers',
    environment: 'miniflare'
  }
});
```

## Advanced Vitest Integration

```typescript
// advanced.test.ts
import { test, expect } from 'vitest';
import { runCucumberInVitest } from '@cucumber/cucumber-workers';
import calculatorFeature from './features/calculator.feature';

test('Run cucumber and access results', async () => {
  const result = await runCucumberInVitest({
    features: [calculatorFeature],
    tagExpression: '@smoke',
    formatters: [{ type: 'progress' }]
  });
  
  // Access the success status
  expect(result.success).toBe(true);
  
  // Access the Cucumber messages
  expect(result.messages.length).toBeGreaterThan(0);
  
  // Find specific test results
  const testCaseFinished = result.messages.find(
    msg => msg.testCaseFinished && msg.testCaseFinished.willBeRetried === false
  );
  
  expect(testCaseFinished).toBeDefined();
  expect(testCaseFinished.testCaseFinished.status).toBe('PASSED');
});
```

## Performance Optimization Examples

### Memory Optimization

```typescript
// Bad practice - creates large arrays
Given('I generate test data', function() {
  this.testData = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    description: `Description for item ${i}`,
    // ... many more properties
  }));
});

// Better practice - create data on demand
Given('I have access to test data', function() {
  this.getTestItem = (id) => ({
    id,
    name: `Item ${id}`,
    description: `Description for item ${id}`
  });
});
```

### Execution Time Optimization

```typescript
// Bad practice - sequential processing
When('I process all items', async function() {
  const results = [];
  for (const item of this.items) {
    results.push(await processItem(item)); // Sequential
  }
  this.results = results;
});

// Better practice - parallel processing where appropriate
When('I process all items', async function() {
  this.results = await Promise.all(
    this.items.map(item => processItem(item)) // Parallel
  );
});
```

## Complete Project Example

See the `examples` directory for complete project examples:

- `examples/basic`: Simple calculator example
- `examples/formatters`: Examples of different formatters
- `examples/hooks-and-tags`: Examples of hooks and tag filtering
- `examples/data-tables`: Examples of data table usage
- `examples/scenario-outlines`: Examples of scenario outlines
- `examples/source-mapping`: Examples of source mapping for errors
</rewritten_file> 