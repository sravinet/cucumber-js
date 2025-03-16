/**
 * Vitest configuration for Cucumber Workers examples in Cloudflare Workers
 * 
 * This configuration file sets up Vitest to run the example tests
 * in the Cloudflare Workers environment using @cloudflare/vitest-pool-workers.
 */

import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    // Add the feature transformer as a plugin
    {
      name: 'feature-transformer',
      transform(code, id) {
        if (id.endsWith('.feature')) {
          return {
            code: `export default {
              path: ${JSON.stringify(id)},
              content: ${JSON.stringify(code)}
            };`,
            map: { mappings: '' }
          };
        }
      }
    }
  ],
  resolve: {
    alias: {
      // Use absolute paths to avoid issues with relative paths
      '@cucumber/cucumber-workers': resolve(__dirname, 'src'),
      '@cucumber/cucumber-workers/vitest': resolve(__dirname, 'src/vitest'),
      '@cucumber/cucumber-workers/vite': resolve(__dirname, 'src/vite-plugin')
    }
  },
  test: {
    environment: 'node',
    globals: true,
    include: [
      'examples/test/**/*.test.ts',
      'examples/cloudflare-workers/**/*.test.ts',
      'examples/source-mapping/**/*.test.ts'
    ],
    setupFiles: [
      './test/setup-examples.ts'
    ],
    deps: {
      inline: [
        '@cucumber/cucumber-workers'
      ]
    },
    // @ts-expect-error - The pool property is supported by vitest-pool-workers but not in the type definitions
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
    }
  }
}); 