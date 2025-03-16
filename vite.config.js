import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the cucumber-workers package
const cucumberWorkersPath = path.resolve(__dirname, '../cucumber-workers');
const cucumberWorkersDistPath = path.resolve(cucumberWorkersPath, 'dist');

// Check if the cucumber-workers package is built
if (!fs.existsSync(path.join(cucumberWorkersDistPath, 'esm', 'vitest.js'))) {
  console.warn('Warning: cucumber-workers package is not built. Tests requiring it may fail.');
}

export default defineConfig({
  resolve: {
    alias: {
      '@cucumber/cucumber-workers': cucumberWorkersPath,
      '@cucumber/cucumber-workers/vitest': path.resolve(cucumberWorkersDistPath, 'esm', 'vitest.js')
    }
  },
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