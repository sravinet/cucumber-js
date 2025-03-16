/**
 * Runtime options for Cucumber Workers
 */

/**
 * Enhanced error message options
 */
export interface ErrorMessageOptions {
  /**
   * Whether to include colors in error messages
   */
  colors?: boolean;
  
  /**
   * Whether to include context information in error messages
   */
  includeContext?: boolean;
  
  /**
   * Number of context lines to include in error messages
   */
  contextLines?: number;
}

/**
 * Runtime options for Cucumber Workers
 */
export interface RuntimeOptions {
  /**
   * Whether to run in dry run mode
   */
  dryRun?: boolean;
  
  /**
   * Whether to fail fast
   */
  failFast?: boolean;
  
  /**
   * Whether to filter stacktraces
   */
  filterStacktraces?: boolean;
  
  /**
   * Whether to use source maps for error stack traces
   */
  useSourceMaps?: boolean;
  
  /**
   * Enhanced error message options
   */
  errorMessages?: ErrorMessageOptions;
}

/**
 * Source map options
 */
export interface SourceMapOptions {
  /**
   * Whether to include source content in the source map
   */
  includeSourceContent?: boolean;
  
  /**
   * Whether to filter stack traces to only show relevant frames
   */
  filterStacktraces?: boolean;
} 