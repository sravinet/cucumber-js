import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['test/**/*.test.ts'],
    exclude: [
      // Exclude tests that are specifically for the Workers environment
      // when running in Node.js
      'test/**/scenario-outline-processor.test.ts'
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