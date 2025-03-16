# Hono Cucumber Demo

This is a demonstration of using Cucumber BDD tests with a Hono application running in Cloudflare Workers. The tests are executed using Vitest with the `@cloudflare/vitest-pool-workers` pool.

## Project Structure

- `src/index.ts` - The main Hono application with counter API endpoints
- `features/counter.feature` - Cucumber feature file with BDD scenarios
- `features/step_definitions/counter.steps.ts` - Step definitions for the BDD tests
- `test/counter.test.ts` - Test file that runs the Cucumber tests using Vitest

## Prerequisites

- Node.js 16+
- pnpm (recommended) or npm

## Installation

You have several options to install dependencies:

1. **Using pnpm directly** (recommended):
   ```bash
   pnpm install
   ```

2. **Using npm scripts**:
   ```bash
   pnpm run setup        # Run the setup script
   pnpm run install:deps # Run the dependency installation script
   ```

3. **Using the setup script**:
   ```bash
   ./setup.sh
   ```
   This will install dependencies and create the required KV namespaces.

4. **Using the install-deps.js script**:
   ```bash
   node install-deps.js
   ```
   This script will check for missing dependencies and install them as needed.

## Running the Application

To run the application locally:

```bash
pnpm run dev
```

This will start the Hono application using Wrangler, making it available at http://localhost:8787.

## Running the Tests

The recommended way to run the tests is with:

```bash
pnpm run test:all
```

This command attempts different methods to run the tests until one succeeds. It automatically links the `cucumber-workers` package before running the tests.

You can also run the tests directly with:

```bash
pnpm run test
```

This command will automatically link the `cucumber-workers` package before running the tests.

### Linking the cucumber-workers package

If you're having issues with the `cucumber-workers` package, you can manually link it with:

```bash
pnpm run link-cucumber-workers
```

This script:
1. Checks if the `cucumber-workers` package is built
2. Creates a symlink from the local `cucumber-workers` package to the `node_modules/@cucumber/cucumber-workers` directory
3. Ensures that the tests can find the package

## Troubleshooting

If you encounter issues with running the tests:

1. **Try the automatic method detection**:
   ```bash
   pnpm run test:all
   ```
   This script will try different methods to run the tests until one succeeds.

2. **Missing dependencies**: Run the dependency installation script:
   ```bash
   pnpm run install:deps
   ```

3. **Vitest not found**: Try using the direct test script:
   ```bash
   pnpm run test:direct
   ```
   This script will find vitest in your node_modules directory and run it directly.

4. **Binary not linked**: If pnpm isn't linking binaries correctly, try:
   ```bash
   pnpm install -g vitest
   ```
   Or use the direct path:
   ```bash
   ./node_modules/.bin/vitest run
   ```

5. **KV namespace issues**: Set up the KV namespaces manually:
   ```bash
   npx wrangler kv:namespace create COUNTER --preview
   npx wrangler kv:namespace create COUNTER
   ```

6. **TypeScript errors**: Check for TypeScript errors:
   ```bash
   npx tsc --noEmit
   ```

7. **Path issues**: Make sure you're running commands from the project root directory:
   ```bash
   cd packages/hono-cucumber-demo
   ```

8. **Module errors**: If you see errors about ES modules vs CommonJS, make sure you're using the correct import syntax in your files:
   ```javascript
   // Use ES module syntax (import/export) not CommonJS (require/module.exports)
   import { something } from 'somewhere';
   ```

## Why We Use ES Modules

This project uses ES Modules (ESM) instead of CommonJS. For more information about why we made this choice and how we implemented it, see [WHY_PNPM_INSTALL_FAILED.md](./WHY_PNPM_INSTALL_FAILED.md).

## API Endpoints

The application provides the following endpoints:

- `GET /` - Returns a simple greeting message
- `GET /counter/:id` - Gets the current value of a counter
- `POST /counter/:id/increment` - Increments a counter by 1
- `POST /counter/:id/reset` - Resets a counter to 0

## BDD Scenarios

The BDD tests cover the following scenarios:

1. Getting a counter that doesn't exist yet (should return 0)
2. Incrementing a counter and verifying the new value
3. Resetting a counter to 0

## How It Works

1. The Cucumber feature file defines the behavior of the counter API using Gherkin syntax
2. Step definitions implement the test steps using the Hono application
3. The test file uses `@cucumber/cucumber-workers` to run the Cucumber tests in the Cloudflare Workers environment
4. Vitest with `@cloudflare/vitest-pool-workers` executes the tests in a simulated Workers environment

## Notes

- The KV namespace is mocked for testing purposes
- The tests run in a simulated Cloudflare Workers environment using Miniflare
- The application uses TypeScript for type safety 