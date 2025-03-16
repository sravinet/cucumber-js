import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // @ts-expect-error - The pool property is supported by vitest-pool-workers but not in the type definitions
    pool: 'workers',
    testTimeout: 10000, // Increase timeout for Workers tests
    globals: true,
    include: [
      'test/**/*.test.ts',
      // Explicitly include the new scenario outline processor tests
      'test/core/scenario-outline-processor/**/*.test.ts'
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