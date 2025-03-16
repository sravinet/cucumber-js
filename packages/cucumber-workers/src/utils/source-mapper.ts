/**
 * Source mapper for error stack traces
 * 
 * This utility maps error stack traces back to feature files and step definitions,
 * providing better error reporting in the Workers environment.
 */

import { SourceMapConsumer } from 'source-map';

/**
 * Options for the source mapper
 */
export interface SourceMapperOptions {
  /**
   * Whether to include source content in the source map
   */
  includeSourceContent?: boolean;
  
  /**
   * Whether to filter stack traces to only show relevant frames
   */
  filterStackTraces?: boolean;
  
  /**
   * Logger function for errors
   */
  logger?: (message: string) => void;
}

/**
 * Source location information
 */
export interface SourceLocation {
  /**
   * Source file path
   */
  source: string;
  
  /**
   * Line number (1-indexed)
   */
  line: number;
  
  /**
   * Column number (1-indexed)
   */
  column: number;
  
  /**
   * Original source content
   */
  content?: string;
}

/**
 * Mapped stack frame
 */
export interface MappedStackFrame {
  /**
   * Function name
   */
  functionName: string;
  
  /**
   * Original location
   */
  originalLocation: SourceLocation;
  
  /**
   * Generated location
   */
  generatedLocation: {
    /**
     * File path
     */
    file: string;
    
    /**
     * Line number (1-indexed)
     */
    line: number;
    
    /**
     * Column number (1-indexed)
     */
    column: number;
  };
}

/**
 * Source mapper for error stack traces
 */
export class SourceMapper {
  private sourceMapConsumers = new Map<string, SourceMapConsumer>();
  private options: SourceMapperOptions;
  
  /**
   * Create a new source mapper
   * 
   * @param options - Source mapper options
   */
  constructor(options: SourceMapperOptions = {}) {
    this.options = {
      includeSourceContent: true,
      filterStackTraces: true,
      logger: (_message: string) => { /* noop */ },
      ...options
    };
  }
  
  /**
   * Register a source map for a file
   * 
   * @param filePath - Path to the file
   * @param sourceMapContent - Source map content
   */
  async registerSourceMap(filePath: string, sourceMapContent: string): Promise<void> {
    try {
      const sourceMapJson = JSON.parse(sourceMapContent);
      const consumer = await new SourceMapConsumer(sourceMapJson);
      this.sourceMapConsumers.set(filePath, consumer);
    } catch (error) {
      this.options.logger?.(`Error registering source map for ${filePath}: ${(error as Error).message}`);
    }
  }
  
  /**
   * Map an error stack trace to original source locations
   * 
   * @param error - Error to map
   * @returns Mapped error with original stack trace
   */
  async mapErrorStack(error: Error): Promise<Error> {
    if (!error.stack) {
      return error;
    }
    
    // Parse the stack trace
    const stackFrames = this.parseStackTrace(error.stack);
    
    // Map each stack frame to its original location
    const mappedFrames: MappedStackFrame[] = [];
    
    for (const frame of stackFrames) {
      const mappedFrame = await this.mapStackFrame(frame);
      if (mappedFrame) {
        mappedFrames.push(mappedFrame);
      }
    }
    
    // Filter stack frames if enabled
    const filteredFrames = this.options.filterStackTraces
      ? this.filterStackFrames(mappedFrames)
      : mappedFrames;
    
    // Create a new error with the mapped stack trace
    const mappedError = new Error(error.message);
    mappedError.stack = this.formatStackTrace(filteredFrames);
    
    return mappedError;
  }
  
  /**
   * Parse a stack trace string into individual frames
   * 
   * @param stackTrace - Stack trace string
   * @returns Parsed stack frames
   */
  private parseStackTrace(stackTrace: string): Array<{
    functionName: string;
    file: string;
    line: number;
    column: number;
  }> {
    const frames: Array<{
      functionName: string;
      file: string;
      line: number;
      column: number;
    }> = [];
    
    // Split the stack trace into lines
    const lines = stackTrace.split('\n');
    
    // Skip the first line (error message)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Parse the stack frame
      // Example: "at functionName (/path/to/file.js:10:20)"
      const match = line.match(/at\s+(?:(.+?)\s+\()?(?:(.+?):(\d+):(\d+))\)?/);
      
      if (match) {
        const [, functionName = '<anonymous>', file, lineStr, columnStr] = match;
        
        frames.push({
          functionName,
          file,
          line: parseInt(lineStr, 10),
          column: parseInt(columnStr, 10)
        });
      }
    }
    
    return frames;
  }
  
  /**
   * Map a stack frame to its original source location
   * 
   * @param frame - Stack frame to map
   * @returns Mapped stack frame
   */
  private async mapStackFrame(frame: {
    functionName: string;
    file: string;
    line: number;
    column: number;
  }): Promise<MappedStackFrame | null> {
    // Find the source map consumer for this file
    const consumer = this.sourceMapConsumers.get(frame.file);
    
    if (!consumer) {
      // No source map for this file, return the original frame
      return {
        functionName: frame.functionName,
        originalLocation: {
          source: frame.file,
          line: frame.line,
          column: frame.column
        },
        generatedLocation: {
          file: frame.file,
          line: frame.line,
          column: frame.column
        }
      };
    }
    
    // Map the location to the original source
    const originalPosition = consumer.originalPositionFor({
      line: frame.line,
      column: frame.column
    });
    
    if (!originalPosition.source) {
      // Couldn't map to an original source
      return null;
    }
    
    // Get the original source content if available and requested
    let content: string | undefined;
    if (this.options.includeSourceContent) {
      content = consumer.sourceContentFor(originalPosition.source);
    }
    
    return {
      functionName: originalPosition.name || frame.functionName,
      originalLocation: {
        source: originalPosition.source,
        line: originalPosition.line || frame.line,
        column: originalPosition.column || frame.column,
        content
      },
      generatedLocation: {
        file: frame.file,
        line: frame.line,
        column: frame.column
      }
    };
  }
  
  /**
   * Filter stack frames to only show relevant ones
   * 
   * @param frames - Stack frames to filter
   * @returns Filtered stack frames
   */
  private filterStackFrames(frames: MappedStackFrame[]): MappedStackFrame[] {
    // Filter out frames from node_modules and internal modules
    return frames.filter(frame => {
      const source = frame.originalLocation.source;
      
      // Keep frames from feature files and step definitions
      if (source.endsWith('.feature') || source.includes('step_definitions')) {
        return true;
      }
      
      // Filter out frames from node_modules
      if (source.includes('node_modules')) {
        return false;
      }
      
      // Keep other frames
      return true;
    });
  }
  
  /**
   * Format mapped stack frames into a stack trace string
   * 
   * @param frames - Mapped stack frames
   * @returns Formatted stack trace string
   */
  private formatStackTrace(frames: MappedStackFrame[]): string {
    let stackTrace = 'Error\n';
    
    for (const frame of frames) {
      const { functionName, originalLocation } = frame;
      const { source, line, column, content } = originalLocation;
      
      // Add the stack frame
      stackTrace += `    at ${functionName} (${source}:${line}:${column})\n`;
      
      // Add source content if available
      if (content) {
        const lines = content.split('\n');
        const lineIndex = line - 1;
        
        if (lineIndex >= 0 && lineIndex < lines.length) {
          // Add the source line
          stackTrace += `        ${lines[lineIndex]}\n`;
          
          // Add a pointer to the column
          stackTrace += `        ${' '.repeat(column - 1)}^\n`;
        }
      }
    }
    
    return stackTrace;
  }
  
  /**
   * Dispose of all source map consumers
   */
  dispose(): void {
    // Clear the map of source map consumers
    // Note: The SourceMapConsumer API doesn't have a standard destroy method
    // in all versions, so we're just clearing the map to release references
    this.sourceMapConsumers.clear();
  }
} 