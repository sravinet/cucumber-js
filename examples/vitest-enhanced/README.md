# Enhanced Cucumber.js with Vitest Example

This example demonstrates how to use the enhanced Vitest adapter for Cucumber.js, which provides deeper integration between Cucumber.js and Vitest.

## Features

- Uses the new Vitest adapter from Phase 2 of the Vitest integration
- Demonstrates two ways to run Cucumber features in Vitest:
  1. Using the `createVitestCucumberTest` helper function
  2. Using the `runCucumberInVitest` function directly with custom hooks
- Shows how to access and assert on Cucumber messages
- Includes Vitest hooks integration

## Project Structure

- `cucumber.test.js` - Vitest test file that runs Cucumber features using the new adapter
- `vitest.config.js` - Vitest configuration
- `src/counter.js` - Counter implementation
- `features/counter.feature` - Cucumber feature file
- `features/step_definitions/counter_steps.js` - Step definitions
- `features/support/world.js` - Custom World object

## How It Works

This example uses the enhanced Vitest adapter from Phase 2 of the Vitest integration. The adapter provides two main functions:

1. `createVitestCucumberTest` - A helper function that creates a Vitest test that runs Cucumber features
2. `runCucumberInVitest` - A function that runs Cucumber features in Vitest's environment and returns the result

The adapter handles the integration between Cucumber.js and Vitest, ensuring that:

- Cucumber's runtime works within Vitest's worker threads
- Feature and step definition loading works with Vitest's file system
- Cucumber messages are captured and available for assertions
- Custom hooks can be provided for setup and teardown

## Running the Example

```bash
npm install
npm test
```

## Key Differences from Basic Example

- Uses the new Vitest adapter instead of directly calling `runCucumber`
- Provides access to Cucumber messages for assertions
- Supports custom hooks for setup and teardown
- Offers a simplified API with the `createVitestCucumberTest` helper 