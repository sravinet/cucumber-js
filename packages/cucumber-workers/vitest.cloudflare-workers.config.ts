/**
 * Vitest configuration for Cucumber Workers in Cloudflare Workers
 * 
 * This configuration file sets up Vitest to run Cucumber tests in
 * Cloudflare Workers using @cloudflare/vitest-pool-workers.
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    pool: '@cloudflare/vitest-pool-workers',
    poolOptions: {
      workers: {
        // Cloudflare Workers specific configuration
        memoryLimit: 128, // 128 MB memory limit
        cpuLimit: 10000, // 10 seconds CPU time limit
        
        // Additional Workers configuration
        miniflare: {
          // Miniflare configuration for local development
          kvNamespaces: ['TEST_KV'],
          durableObjects: {
            TEST_DO: 'TestDurableObject'
          },
          r2Buckets: ['TEST_BUCKET'],
          d1Databases: ['TEST_DB'],
          cacheAPIs: true,
          globalAsyncIO: true,
          globalTimers: true,
          globalRandom: true,
          modules: true
        }
      }
    },
    testTimeout: 30000, // Increase timeout for Workers tests
    globals: true,
    include: [
      // Include tests that are specifically for the Workers environment
      'test/**/*.cloudflare.test.ts',
      'test/**/*.workers.test.ts',
      'test/**/*-cloudflare.test.ts',
      'test/**/*-workers.test.ts'
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