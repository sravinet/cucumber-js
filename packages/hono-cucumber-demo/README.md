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

2. **Using the setup script**:
   ```bash
   pnpm run setup
   ```
   This will:
   - Install dependencies
   - Build the cucumber-workers package
   - Create the required KV namespaces for Cloudflare Workers

3. **Using the install-deps.js script**:
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

To run the tests, simply use:

```bash
pnpm test
```

This command automatically:
1. Builds the `cucumber-workers` package if needed
2. Runs all the tests using Vitest

For development with watch mode:

```bash
pnpm run test:watch
```

### Package Dependencies

This project uses PNPM workspace features to manage dependencies between packages in the monorepo. The `@cucumber/cucumber-workers` package is referenced as a workspace dependency, which means PNPM automatically links it during installation.

## Troubleshooting

If you encounter issues with running the tests:

1. **Rebuild the cucumber-workers package**: 
   ```bash
   pnpm run build-cucumber-workers
   ```

2. **Check for missing dependencies**: 
   ```bash
   pnpm install
   ```

3. **Verify the Hono package is installed**:
   ```bash
   pnpm add hono
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