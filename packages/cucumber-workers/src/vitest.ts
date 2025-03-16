/**
 * Vitest integration for Cucumber.js in Cloudflare Workers
 * 
 * This module provides integration between Cucumber.js, Vitest, and
 * Cloudflare Workers via vitest-pool-workers.
 */

import { WorkersFeatureLoader, type FeatureFile } from './core/feature-loader.js';
import { runCucumberInWorkers, type WorkersRuntime, type WorkersCucumberOptions } from './adapters/workers-runtime-adapter.js';
import { BasicFormatter } from './formatters/basic-formatter.js';
import { JsonFormatter } from './formatters/json-formatter.js';

/**
 * Formatter configuration for Cucumber tests
 */
export interface FormatterConfig {
  /**
   * Type of formatter
   */
  type: 'basic' | 'json' | 'progress' | 'summary';
  
  /**
   * Custom formatter instance
   */
  formatter?: BasicFormatter | JsonFormatter;
  
  /**
   * Output file path
   */
  outputFile?: string;
  
  /**
   * Additional formatter options
   */
  options?: Record<string, any>;
}

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
  
  /**
   * Formatters to use for output
   */
  formatters?: FormatterConfig[];
}

// Add type declaration for Miniflare in globalThis
declare global {
  interface Window {
    Miniflare?: unknown;
  }
}

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
    // Determine if we're running in a Cloudflare Workers environment
    const isWorkersEnvironment = typeof globalThis.caches !== 'undefined' || 
                                typeof (globalThis as any).Miniflare !== 'undefined';
    
    let workerRuntime: WorkersRuntime;
    
    if (isWorkersEnvironment) {
      // We're in a Workers environment, use the Workers runtime
      workerRuntime = {
        console: {
          log: console.log,
          error: console.error,
          warn: console.warn,
          info: console.info,
          debug: console.debug,
          stdout: {
            write: (data: string) => console.log(data)
          },
          stderr: {
            write: (data: string) => console.error(data)
          }
        },
        env: Object.fromEntries(
          Object.entries(globalThis.process?.env || {})
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        ),
        fetch: globalThis.fetch
      };
    } else {
      // We're in a Node.js environment, use a Node.js compatible runtime
      const safeConsole = {
        log: (...args: any[]) => console.log(...args),
        error: (...args: any[]) => console.error(...args),
        warn: (...args: any[]) => console.warn(...args),
        info: (...args: any[]) => console.info(...args),
        debug: (...args: any[]) => console.debug(...args)
      };
      
      workerRuntime = {
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
        env: Object.fromEntries(
          Object.entries(process.env)
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        ),
        fetch: globalThis.fetch
      };
    }
    
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
    
    // Configure formatters
    const formats: WorkersCucumberOptions['formats'] = {};
    
    if (options.formatters && options.formatters.length > 0) {
      // Process formatter configurations
      for (const formatterConfig of options.formatters) {
        if (formatterConfig.formatter) {
          // If a formatter instance is provided, use it directly
          // This will be handled by the runtime adapter
          
          // Start the formatter
          formatterConfig.formatter.start();
          
          // Register it with the runtime
          // (This is a placeholder - the actual implementation will depend on the runtime adapter)
        } else {
          // Otherwise, configure the format options
          if (formatterConfig.type === 'json' && formatterConfig.outputFile) {
            formats.files = formats.files || {};
            formats.files[formatterConfig.outputFile] = 'json';
          } else if (formatterConfig.type === 'basic') {
            formats.stdout = 'basic';
          }
          
          // Add other formatter types as they are implemented
        }
      }
    } else {
      // Default to basic formatter
      formats.stdout = 'basic';
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
      },
      formats
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