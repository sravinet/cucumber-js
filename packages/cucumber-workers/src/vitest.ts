/**
 * Vitest integration for Cucumber.js in Cloudflare Workers
 * 
 * This module provides integration between Cucumber.js, Vitest, and
 * Cloudflare Workers via vitest-pool-workers.
 */

import { WorkersFeatureLoader, type FeatureFile } from './core/feature-loader.js';
import { runCucumberInWorkers, type WorkersRuntime, type WorkersCucumberOptions } from './adapters/workers-runtime-adapter.js';

/**
 * Options for creating a Cucumber test in Vitest
 */
export interface CucumberTestOptions {
  /**
   * Name of the test
   */
  name: string;
  
  /**
   * Feature files to run
   */
  features: (string | FeatureFile)[];
  
  /**
   * Tag expression to filter scenarios
   * @example '@smoke and not @slow'
   */
  tagExpression?: string;
  
  /**
   * World parameters
   */
  worldParameters?: Record<string, any>;
  
  /**
   * Runtime options
   */
  runtime?: {
    /**
     * Whether to run in dry run mode
     */
    dryRun?: boolean;
    
    /**
     * Whether to fail fast
     */
    failFast?: boolean;
  };
}

// Safe console functions that don't trigger linter warnings
const safeConsole = {
  log: (...args: any[]): void => {
    // eslint-disable-next-line no-console
    console.log(...args);
  },
  error: (...args: any[]): void => {
    // eslint-disable-next-line no-console
    console.error(...args);
  },
  warn: (...args: any[]): void => {
    // eslint-disable-next-line no-console
    console.warn(...args);
  },
  info: (...args: any[]): void => {
    // eslint-disable-next-line no-console
    console.info(...args);
  },
  debug: (...args: any[]): void => {
    // eslint-disable-next-line no-console
    console.debug(...args);
  }
};

/**
 * Create a Cucumber test in Vitest
 * 
 * @param testFn - Vitest test function
 * @param options - Options for the Cucumber test
 */
export function createCucumberTest(
  testFn: (name: string, fn: () => Promise<void>) => void,
  options: CucumberTestOptions
): void {
  testFn(options.name, async () => {
    // Get the worker runtime from the Vitest context
    // This is a placeholder that will be implemented when integrating with vitest-pool-workers
    const workerRuntime: WorkersRuntime = {
      console: {
        log: safeConsole.log,
        error: safeConsole.error,
        warn: safeConsole.warn,
        info: safeConsole.info,
        debug: safeConsole.debug,
        stdout: {
          write: (data: string) => process.stdout.write(data)
        },
        stderr: {
          write: (data: string) => process.stderr.write(data)
        }
      },
      env: process.env as Record<string, string>,
      fetch: globalThis.fetch
    };
    
    // Create a feature loader and register all features
    const featureLoader = new WorkersFeatureLoader();
    const featurePaths: string[] = [];
    
    for (const feature of options.features) {
      if (typeof feature === 'string') {
        featurePaths.push(feature);
      } else {
        featureLoader.register(feature.path, feature.content);
        featurePaths.push(feature.path);
      }
    }
    
    // Run Cucumber with the provided options
    const result = await runCucumberInWorkers({
      features: {
        paths: featurePaths
      },
      support: {
        worldParameters: options.worldParameters
      },
      runtime: options.runtime,
      filters: {
        tagExpression: options.tagExpression
      }
    }, workerRuntime);
    
    // Assert that the test run was successful
    if (!result.success) {
      throw new Error(`Cucumber test run failed with ${result.summary.failed} failures`);
    }
  });
}

/**
 * Run Cucumber in Vitest with vitest-pool-workers
 * 
 * @param options - Options for running Cucumber
 * @param workerRuntime - Workers runtime environment
 * @returns Result of the Cucumber run
 */
export async function runCucumberInVitest(
  options: WorkersCucumberOptions,
  workerRuntime: WorkersRuntime
): Promise<any> {
  return await runCucumberInWorkers(options, workerRuntime);
} 