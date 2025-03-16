import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // @ts-expect-error - The pool property is supported by vitest-pool-workers but not in the type definitions
    pool: 'workers',
    testTimeout: 10000, // Increase timeout for Workers tests
    globals: true,
    include: [
      // Include only tests that are specifically for the Workers environment
      'test/**/workers-runtime-adapter-cloudflare.test.ts',
      'test/**/json-formatter-cloudflare.test.ts',
      'test/**/progress-formatter-cloudflare.test.ts',
      'test/**/summary-formatter-cloudflare.test.ts',
      'test/**/cloudflare-integration.test.ts'
    ],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'test/']
    },
    typecheck: {
      tsconfig: './tsconfig.test.json'
    }
  }
}); 