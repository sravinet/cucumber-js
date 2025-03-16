# Hono Cucumber Demo

This repository includes a demonstration of using Cucumber BDD tests with a Hono application running in Cloudflare Workers. The tests are executed using Vitest with the `@cloudflare/vitest-pool-workers` pool.

## Running the Demo from the Root Directory

You can run the Hono Cucumber Demo tests from the root directory of the cucumber-js repository with a single command:

```bash
pnpm run test:hono
```

This command automatically:
1. Links the cucumber-workers package
2. Runs all the tests using Vitest

If you need to manually link the package:

```bash
pnpm run link:hono
```

## Navigating to the Demo Directory

Alternatively, you can navigate to the demo directory and run the tests from there:

```bash
# Navigate to the demo directory
cd packages/hono-cucumber-demo

# Install dependencies
pnpm install

# Run tests
pnpm test
```

## Demo Features

The Hono Cucumber Demo showcases:

1. **BDD Testing with Cucumber**: Using Cucumber's Gherkin syntax for behavior-driven development
2. **Cloudflare Workers Integration**: Running tests in a simulated Cloudflare Workers environment
3. **Vitest Integration**: Using Vitest as the test runner with `@cloudflare/vitest-pool-workers`
4. **ES Modules**: Using modern JavaScript with ES Modules
5. **TypeScript**: Full TypeScript support for type safety

## Documentation

For more detailed information, see the [README.md](./packages/hono-cucumber-demo/README.md) in the demo directory.

## Troubleshooting

If you encounter issues running the tests, see the [Troubleshooting section](./packages/hono-cucumber-demo/README.md#troubleshooting) in the demo README. 