# Cucumber Workers Examples

This directory contains examples of using Cucumber Workers in different environments.

## Running the Examples

You can run the examples using the following commands:

### Standard Node Environment

```bash
# Run all examples
pnpm run test:examples

# Watch mode
pnpm run test:examples:watch
```

### Cloudflare Workers Environment

```bash
# Run all examples in Cloudflare Workers environment
pnpm run test:examples:cloudflare
```

## Example Projects

### Cloudflare Workers Example

The [cloudflare-workers](./cloudflare-workers) directory contains an example of using Cucumber Workers with Cloudflare Workers. It demonstrates:

1. Writing feature files for Cloudflare Workers
2. Implementing step definitions that work in the Workers environment
3. Configuring Vitest to run tests in Cloudflare Workers
4. Using Workers-specific optimizations

See the [cloudflare-workers/README.md](./cloudflare-workers/README.md) for more details.

### Source Mapping Example

The [source-mapping](./source-mapping) directory contains an example of using source maps with Cucumber Workers. It demonstrates:

1. Enabling source maps for better error reporting
2. Configuring source map options
3. Using source maps in the Cloudflare Workers environment
4. Debugging with source maps

This example shows how to get better error stack traces when tests fail, making it easier to debug issues in your Cucumber tests.

## Troubleshooting

If you encounter issues running the examples, try the following:

1. Make sure you have installed all dependencies:
   ```bash
   pnpm install
   ```

2. Make sure the Cloudflare Workers environment is properly set up:
   ```bash
   pnpm add -D @cloudflare/vitest-pool-workers miniflare
   ```

3. Check the console output for any error messages.

4. If you see import errors, make sure the aliases in `vitest.examples.config.ts` and `vitest.cloudflare-examples.config.ts` are correctly set up.

5. If you see errors related to the Cloudflare Workers environment, make sure the setup file in `test/setup-examples.ts` is correctly configured. 