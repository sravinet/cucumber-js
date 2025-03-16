import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Temporarily comment out the Cloudflare Workers pool
    // pool: '@cloudflare/vitest-pool-workers',
    // poolOptions: {
    //   workers: {
    //     // Cloudflare Workers specific configuration
    //     memoryLimit: 128, // 128 MB memory limit
    //     cpuLimit: 10000, // 10 seconds CPU time limit
    //     
    //     // Miniflare configuration for local development
    //     miniflare: {
    //       kvNamespaces: ['COUNTER'],
    //       cacheAPIs: true,
    //       globalAsyncIO: true,
    //       globalTimers: true,
    //       globalRandom: true,
    //       modules: true
    //     }
    //   }
    // },
    testTimeout: 30000, // Increase timeout for Workers tests
    globals: true,
    include: [
      'test/**/*.test.ts'
    ],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'test/']
    }
  }
}); 