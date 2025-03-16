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
import { ProgressFormatter } from './formatters/progress-formatter.js';
import { SummaryFormatter } from './formatters/summary-formatter.js';
import { SourceMapper } from './utils/source-mapper.js';

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
  formatter?: BasicFormatter | JsonFormatter | ProgressFormatter | SummaryFormatter;
  
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
    
    /**
     * Whether to use source maps for error stack traces
     */
    useSourceMaps?: boolean;
  };
  
  /**
   * Formatters to use for output
   */
  formatters?: FormatterConfig[];
  
  /**
   * Source map options
   */
  sourceMaps?: {
    /**
     * Whether to include source content in the source map
     */
    includeSourceContent?: boolean;
    
    /**
     * Whether to filter stack traces to only show relevant frames
     */
    filterStackTraces?: boolean;
  };
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
  // Create a test with the given name
  testFn(options.name, async () => {
    // Load feature files
    const featureLoader = new WorkersFeatureLoader();
    const featurePaths: string[] = [];
    
    for (const feature of options.features) {
      if (typeof feature === 'string') {
        featurePaths.push(feature);
      } else {
        // In a real implementation, we would register the feature file
        // with the feature loader
        featurePaths.push(feature.path);
      }
    }
    
    // Create a Workers runtime adapter
    const workerRuntime: WorkersRuntime = {
      console: {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info,
        debug: console.debug,
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
    
    // Create formatters
    const formatters: Record<string, any> = {};
    
    if (options.formatters) {
      for (const formatterConfig of options.formatters) {
        if (formatterConfig.formatter) {
          formatters[formatterConfig.type] = formatterConfig.formatter;
        } else {
          // In a real implementation, we would create the formatter
          // based on the type and options
          switch (formatterConfig.type) {
            case 'basic':
              formatters.basic = new BasicFormatter(formatterConfig.options);
              break;
            case 'json':
              formatters.json = new JsonFormatter(formatterConfig.options);
              break;
            case 'progress':
              formatters.progress = new ProgressFormatter(formatterConfig.options);
              break;
            case 'summary':
              formatters.summary = new SummaryFormatter(formatterConfig.options);
              break;
          }
        }
      }
    }
    
    // If no formatters are specified, use the progress formatter by default
    if (Object.keys(formatters).length === 0) {
      formatters.progress = new ProgressFormatter();
    }
    
    // Create Cucumber options
    const cucumberOptions: WorkersCucumberOptions = {
      features: {
        paths: featurePaths
      },
      support: {
        worldParameters: options.worldParameters
      },
      runtime: {
        dryRun: options.runtime?.dryRun,
        failFast: options.runtime?.failFast,
        useSourceMaps: options.runtime?.useSourceMaps !== false
      },
      filters: {
        tagExpression: options.tagExpression
      },
      sourceMaps: {
        includeSourceContent: options.sourceMaps?.includeSourceContent,
        filterStackTraces: options.sourceMaps?.filterStackTraces
      }
    };
    
    // Run Cucumber in the Workers runtime
    const result = await runCucumberInWorkers(cucumberOptions, workerRuntime);
    
    // Check if the test passed
    if (!result.success) {
      throw new Error(`Cucumber test failed: ${result.summary.failed} of ${result.summary.total} scenarios failed`);
    }
  });
}

/**
 * Run Cucumber in Vitest
 * 
 * This function is used by the Vitest pool to run Cucumber tests in Workers.
 * 
 * @param options - Options for running Cucumber
 * @param workerRuntime - Workers runtime environment
 * @returns Result of the Cucumber run
 */
export async function runCucumberInVitest(
  options: WorkersCucumberOptions,
  workerRuntime: WorkersRuntime
): Promise<any> {
  // Create a source mapper if source maps are enabled
  let sourceMapper: SourceMapper | undefined;
  if (options.runtime?.useSourceMaps !== false) {
    sourceMapper = new SourceMapper({
      includeSourceContent: options.sourceMaps?.includeSourceContent,
      filterStackTraces: options.sourceMaps?.filterStackTraces,
      logger: (message) => workerRuntime.console.debug(message)
    });
  }
  
  try {
    // Run Cucumber in the Workers runtime
    const result = await runCucumberInWorkers(options, workerRuntime);
    
    // Return the result
    return result;
  } catch (error) {
    // Map the error stack trace if source maps are enabled
    if (sourceMapper && error instanceof Error) {
      const mappedError = await sourceMapper.mapErrorStack(error);
      throw mappedError;
    }
    
    // Re-throw the original error
    throw error;
  } finally {
    // Clean up resources
    sourceMapper?.dispose();
  }
} 