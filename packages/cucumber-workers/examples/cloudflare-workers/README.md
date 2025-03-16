# Cucumber Workers with Cloudflare Workers Example

This example demonstrates how to use Cucumber Workers with Cloudflare Workers via `@cloudflare/vitest-pool-workers`.

## Overview

This example implements a simple counter application with Cucumber BDD tests that run in the Cloudflare Workers environment. It demonstrates:

1. Writing feature files for Cloudflare Workers
2. Implementing step definitions that work in the Workers environment
3. Configuring Vitest to run tests in Cloudflare Workers
4. Using Workers-specific optimizations

## Files

- `counter.feature` - Gherkin feature file describing the counter behavior
- `counter.steps.ts` - Step definitions for the counter feature
- `counter.test.ts` - Test file that runs the Cucumber tests with Vitest
- `README.md` - This file

## Running the Example

To run this example, use the following command:

```bash
cd packages/cucumber-workers
npm run test:workers
```

This will run the tests using the Cloudflare Workers environment via `@cloudflare/vitest-pool-workers`.

## How It Works

### Feature File

The feature file describes the behavior of a counter in Gherkin syntax:

```gherkin
Feature: Counter in Cloudflare Workers
  As a developer
  I want to increment and decrement a counter in Cloudflare Workers
  So that I can track state in my application

  Background:
    Given I have a counter initialized to 0

  Scenario: Incrementing the counter
    When I increment the counter
    Then the counter value should be 1
```

### Step Definitions

The step definitions implement the steps in the feature file:

```typescript
import { Given, When, Then } from '@cucumber/cucumber-workers';
import { expect } from 'vitest';

// Counter class that works in Cloudflare Workers
class Counter {
  private value: number;

  constructor(initialValue: number = 0) {
    this.value = initialValue;
  }

  increment(): void {
    this.value++;
  }

  // ...
}

Given('I have a counter initialized to {int}', function(initialValue: number) {
  this.counter = new Counter(initialValue);
});

// ...
```

### Test Configuration

The test file configures Vitest to run the Cucumber tests in Cloudflare Workers:

```typescript
import { describe, it } from 'vitest';
import { createCucumberTest } from '@cucumber/cucumber-workers/vitest';

describe('Counter in Cloudflare Workers', () => {
  createCucumberTest(it, {
    name: 'should run counter scenarios',
    features: [
      {
        path: 'examples/cloudflare-workers/counter.feature',
        content: counterFeature
      }
    ],
    // Configure Workers options
    workers: {
      optimize: true,
      memoryLimit: 128,
      cpuLimit: 10000,
      useWorkersRuntime: true
    }
  });
});
```

## Workers-Specific Optimizations

This example demonstrates several Workers-specific optimizations:

1. **Memory Efficiency**: The code is optimized to work within the 128MB memory limit of Cloudflare Workers.
2. **CPU Efficiency**: The code is optimized to work within the CPU time limits of Cloudflare Workers.
3. **Error Handling**: Error handling is optimized for the Workers environment.
4. **Source Mapping**: Source maps are used to map error stack traces back to the original source code.

## Additional Resources

- [Cucumber Workers Documentation](../../README.md)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Vitest Documentation](https://vitest.dev/)
- [@cloudflare/vitest-pool-workers Documentation](https://www.npmjs.com/package/@cloudflare/vitest-pool-workers) 