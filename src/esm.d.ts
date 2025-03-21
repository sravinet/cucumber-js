/**
 * TypeScript declarations for the ESM entry point
 * 
 * @deprecated The /esm entry point is deprecated and will be removed in a future version.
 * Please use @cucumber/cucumber for basic ESM features or @cucumber/cucumber/vitest for Vitest integration.
 */

// Re-export all types from the main index
export * from './index'

// Additional exports specific to ESM
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