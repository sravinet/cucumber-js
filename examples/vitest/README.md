# Cucumber.js with Vitest Example

This example demonstrates how to use Cucumber.js with Vitest.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Run the tests:

```bash
npm test
```

## Project Structure

- `features/` - Contains Cucumber feature files
  - `calculator.feature` - A simple calculator feature
- `features/step_definitions/` - Contains step definitions
  - `calculator_steps.js` - Step definitions for the calculator feature
- `features/support/` - Contains support files
  - `world.js` - Custom World object
- `cucumber.feature.js` - Vitest test file that runs Cucumber features
- `vitest.config.js` - Vitest configuration

## How It Works

This example uses the Vitest integration entry point of Cucumber.js to run features within Vitest's environment. The `cucumber.feature.js` file uses Vitest's test API to run Cucumber features and assert on the results.

## Notes

- This example uses ESM (ECMAScript Modules)
- The Cucumber features and step definitions are written in JavaScript
- Vitest is configured to use the Node.js environment 