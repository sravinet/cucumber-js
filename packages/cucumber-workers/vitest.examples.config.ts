/**
 * Vitest configuration for Cucumber Workers examples
 * 
 * This configuration file sets up Vitest to run the example tests
 * with proper aliases and configuration for Cloudflare Workers.
 */

import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@cucumber/cucumber-workers': resolve(__dirname, 'src/index.ts'),
      '@cucumber/cucumber-workers/vitest': resolve(__dirname, 'src/vitest.ts'),
      '@cucumber/cucumber-workers/vite': resolve(__dirname, 'src/vite-plugin.ts')
    }
  },
  test: {
    environment: 'node',
    globals: true,
    include: [
      'examples/**/*.test.ts'
    ],
    setupFiles: [
      './test/setup-examples.ts'
    ],
    deps: {
      inline: [
        '@cucumber/cucumber-workers'
      ]
    },
    pool: '@cloudflare/vitest-pool-workers',
    poolOptions: {
      workers: {
        memoryLimit: 128,
        cpuLimit: 10000,
        
        miniflare: {
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
    }
  }
}); 