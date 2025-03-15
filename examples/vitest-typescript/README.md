# Cucumber.js with Vitest and TypeScript Example

This example demonstrates how to use Cucumber.js with Vitest in a TypeScript project.

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
  - `todo.feature` - A simple todo list feature
- `src/` - Contains the application code
  - `todo.ts` - A simple todo list implementation
- `tests/` - Contains test files
  - `step_definitions/` - Contains step definitions
    - `todo_steps.ts` - Step definitions for the todo feature
  - `support/` - Contains support files
    - `world.ts` - Custom World object with TypeScript types
  - `cucumber.test.ts` - Vitest test file that runs Cucumber features
- `tsconfig.json` - TypeScript configuration
- `vitest.config.ts` - Vitest configuration

## How It Works

This example uses the Vitest integration entry point of Cucumber.js to run features within Vitest's environment. The `cucumber.test.ts` file uses Vitest's test API to run Cucumber features and assert on the results.

## Notes

- This example uses TypeScript with ESM (ECMAScript Modules)
- The Cucumber features and step definitions are written in TypeScript
- Vitest is configured to use the Node.js environment and TypeScript 