/**
 * Example Vite configuration for Cucumber Workers
 */
import { defineConfig } from 'vite';
import { cucumberWorkers } from '../src/vite-plugin.js';

export default defineConfig({
  plugins: [
    // Add the Cucumber Workers plugin
    cucumberWorkers({
      // Configure feature file glob pattern
      featureGlob: 'features/**/*.feature',
      
      // Configure step definition glob pattern
      stepDefinitionsGlob: 'features/step_definitions/**/*.ts'
    })
  ],
  
  // Configure Vitest
  test: {
    // Use Node.js as the environment
    environment: 'node',
    
    // Use vitest-pool-workers for running tests in Workers
    pool: '@cloudflare/vitest-pool-workers',
    
    // Configure Workers pool options
    poolOptions: {
      workers: {
        // Workers-specific configuration
        miniflare: {
          // Miniflare configuration for local development
          bindings: {
            // Add your bindings here
          },
          kvNamespaces: [
            // Add your KV namespaces here
          ],
          durableObjects: {
            // Add your Durable Objects here
          }
        }
      }
    },
    
    // Include feature files in the test glob
    include: [
      'features/**/*.feature',
      'test/**/*.{js,ts}'
    ]
  }
}); 