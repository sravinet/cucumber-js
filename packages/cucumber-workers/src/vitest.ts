/**
 * Vitest integration for Cucumber.js in Cloudflare Workers
 * 
 * This module provides integration between Cucumber.js, Vitest, and
 * Cloudflare Workers via vitest-pool-workers.
 */

import { WorkersFeatureLoader, type FeatureFile } from './core/feature-loader.js';
import { runCucumberInWorkers, type WorkersRuntime, type WorkersCucumberOptions, type WorkersCucumberResult } from './adapters/workers-runtime-adapter.js';
import { BasicFormatter } from './formatters/basic-formatter.js';
import { JsonFormatter } from './formatters/json-formatter.js';
import { ProgressFormatter } from './formatters/progress-formatter.js';
import { SummaryFormatter } from './formatters/summary-formatter.js';
import { SourceMapper } from './utils/source-mapper.js';
import { type RuntimeOptions, type SourceMapOptions } from './types/runtime.js';

// Temporarily mock the optimizeForWorkers function until the module is properly set up
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const optimizeForWorkers = (options: { memoryLimit?: number; cpuLimit?: number } = {}) => {
  // These options would be used in the actual implementation
  // const { memoryLimit, cpuLimit } = options;
  return () => { /* cleanup */ };
};

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
  runtime?: RuntimeOptions;
  
  /**
   * Formatters to use for output
   */
  formatters?: FormatterConfig[];
  
  /**
   * Source map options
   */
  sourceMaps?: SourceMapOptions;

  /**
   * Cloudflare Workers specific options
   */
  workers?: {
    /**
     * Whether to optimize for Cloudflare Workers
     */
    optimize?: boolean;

    /**
     * Memory limit for Cloudflare Workers (in MB)
     */
    memoryLimit?: number;

    /**
     * CPU limit for Cloudflare Workers (in ms)
     */
    cpuLimit?: number;

    /**
     * Whether to use the Cloudflare Workers runtime
     */
    useWorkersRuntime?: boolean;
  };
}

// Add type declaration for Miniflare in globalThis
declare global {
  interface Window {
    Miniflare?: unknown;
    FetchEvent?: unknown;
  }
}

/**
 * Check if the current environment is a Cloudflare Workers environment
 */
function isCloudflareWorkersEnvironment(): boolean {
  // Check for Cloudflare Workers runtime
  return (
    typeof (globalThis as any).Miniflare !== 'undefined' ||
    typeof globalThis.Response !== 'undefined' ||
    typeof globalThis.Request !== 'undefined' ||
    typeof globalThis.Headers !== 'undefined' ||
    typeof (globalThis as any).FetchEvent !== 'undefined'
  );
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
    // Check if running in Cloudflare Workers environment
    const isWorkersEnv = options.workers?.useWorkersRuntime ?? isCloudflareWorkersEnvironment();
    
    // Apply Workers optimizations if needed
    if (isWorkersEnv && (options.workers?.optimize ?? true)) {
      optimizeForWorkers({
        memoryLimit: options.workers?.memoryLimit,
        cpuLimit: options.workers?.cpuLimit
      });
    }
    
    // Load feature files
    const featureLoader = new WorkersFeatureLoader();
    
    // Create feature paths
    const featurePaths = options.features.map(feature => {
      if (typeof feature === 'string') {
        return feature;
      } else {
        // Register the feature file with the feature loader
        featureLoader.register(feature.path, feature.content);
        return feature.path;
      }
    });
    
    // Create a Workers runtime adapter
    const workerRuntime: WorkersRuntime = {
      console: {
        // eslint-disable-next-line no-console
        log: console.log,
        // eslint-disable-next-line no-console
        error: console.error,
        // eslint-disable-next-line no-console
        warn: console.warn,
        // eslint-disable-next-line no-console
        info: console.info,
        // eslint-disable-next-line no-console
        debug: console.debug,
        stdout: {
          write: (data: string) => {
            if (typeof process !== 'undefined' && process.stdout) {
              process.stdout.write(data);
            } else {
              // eslint-disable-next-line no-console
              console.log(data);
            }
          }
        },
        stderr: {
          write: (data: string) => {
            if (typeof process !== 'undefined' && process.stderr) {
              process.stderr.write(data);
            } else {
              // eslint-disable-next-line no-console
              console.error(data);
            }
          }
        }
      },
      env: typeof process !== 'undefined' ? (process.env as Record<string, string>) : {},
      fetch: globalThis.fetch
    };
    
    // Create formatters
    const formatters: Record<string, any> = {};
    
    if (options.formatters) {
      for (const formatterConfig of options.formatters) {
        if (formatterConfig.formatter) {
          formatters[formatterConfig.type] = formatterConfig.formatter;
        } else {
          // Create the formatter based on the type and options
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
      formatters.progress = new ProgressFormatter({
        colors: !isWorkersEnv || (options.runtime?.errorMessages?.colors ?? true)
      });
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
        useSourceMaps: options.runtime?.useSourceMaps !== false,
        errorMessages: options.runtime?.errorMessages
      },
      filters: {
        tagExpression: options.tagExpression
      },
      sourceMaps: {
        includeSourceContent: options.sourceMaps?.includeSourceContent,
        filterStacktraces: options.sourceMaps?.filterStacktraces
      },
      formats: {
        stdout: 'progress',
        options: {},
        files: {}
      }
    };
    
    // Add formatters to the options
    if (Object.keys(formatters).length > 0 && cucumberOptions.formats) {
      // Use the first formatter for stdout
      const firstFormatterType = Object.keys(formatters)[0];
      cucumberOptions.formats.stdout = firstFormatterType;
    }
    
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
): Promise<WorkersCucumberResult> {
  // Create a source mapper if source maps are enabled
  let sourceMapper: SourceMapper | undefined;
  if (options.runtime?.useSourceMaps !== false) {
    sourceMapper = new SourceMapper({
      includeSourceContent: options.sourceMaps?.includeSourceContent,
      filterStacktraces: options.sourceMaps?.filterStacktraces,
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