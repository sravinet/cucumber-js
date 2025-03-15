/**
 * TypeScript declarations for the Vitest integration entry point
 */

// Re-export all types from the main index
export * from './index'

// Additional exports specific to Vitest integration
export interface IVitestOptions {
  /**
   * Options specific to Vitest integration
   */
  vitestEnvironment?: 'node' | 'jsdom' | 'happy-dom' | 'edge-runtime'
  /**
   * Custom hooks for Vitest integration
   */
  hooks?: {
    /**
     * Hook called before Cucumber tests are run
     */
    beforeAll?: () => void | Promise<void>
    /**
     * Hook called after Cucumber tests are run
     */
    afterAll?: () => void | Promise<void>
  }
}

// Export Vitest adapter types
export { IVitestRunOptions, IVitestRunResult } from './api/vitest'
export { createVitestCucumberTest, runCucumberInVitest } from './api/vitest' 