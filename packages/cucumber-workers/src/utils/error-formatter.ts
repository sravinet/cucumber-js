/**
 * Error formatter for Cucumber Workers
 * 
 * This utility formats error messages with context information,
 * providing better error reporting in the Workers environment.
 */

import { MappedStackFrame } from './source-mapper.js';

/**
 * Options for formatting errors
 */
export interface ErrorFormatterOptions {
  /**
   * Whether to include colors in the output
   */
  colors?: boolean;
  
  /**
   * Whether to include source content in the output
   */
  includeSourceContent?: boolean;
  
  /**
   * Whether to include context information in the output
   */
  includeContext?: boolean;
  
  /**
   * Maximum number of lines of context to include
   */
  contextLines?: number;
}

/**
 * Format an error with context information
 * 
 * @param error - Error to format
 * @returns Formatted error message
 */
export function formatError(
  error: Error
): string {
  // Start with the error message
  let formattedMessage = error.message;
  
  // Add the stack trace if available
  if (error.stack) {
    formattedMessage += '\n\n' + error.stack;
  }
  
  return formattedMessage;
}

/**
 * Format an error with mapped stack frames
 * 
 * @param error - Error to format
 * @param mappedFrames - Mapped stack frames
 * @param options - Formatting options
 * @returns Formatted error message
 */
export function formatErrorWithMappedFrames(
  error: Error,
  mappedFrames: MappedStackFrame[],
  options: ErrorFormatterOptions = {}
): string {
  const {
    colors = true,
    includeSourceContent = true,
    includeContext = true,
    contextLines = 3
  } = options;
  
  // Start with the error message
  let formattedMessage = colors ? 
    `\x1b[31m${error.name}: ${error.message}\x1b[0m` : 
    `${error.name}: ${error.message}`;
  
  // Add the stack trace with original source locations
  formattedMessage += '\n\nStack trace:';
  
  for (const frame of mappedFrames) {
    const { functionName, originalLocation } = frame;
    const location = `${originalLocation.source}:${originalLocation.line}:${originalLocation.column}`;
    
    formattedMessage += `\n  at ${functionName} (${location})`;
    
    // Add source content context if available and requested
    if (includeContext && includeSourceContent && originalLocation.content) {
      formattedMessage += '\n\n';
      
      // Extract the relevant lines from the source content
      const lines = originalLocation.content.split('\n');
      const lineNumber = originalLocation.line;
      const startLine = Math.max(1, lineNumber - contextLines);
      const endLine = Math.min(lines.length, lineNumber + contextLines);
      
      // Add the context lines
      for (let i = startLine; i <= endLine; i++) {
        const isErrorLine = i === lineNumber;
        const linePrefix = isErrorLine ? '> ' : '  ';
        const lineContent = lines[i - 1] || '';
        
        if (colors && isErrorLine) {
          formattedMessage += `${linePrefix}\x1b[31m${i}: ${lineContent}\x1b[0m\n`;
        } else {
          formattedMessage += `${linePrefix}${i}: ${lineContent}\n`;
        }
      }
      
      formattedMessage += '\n';
    }
  }
  
  return formattedMessage;
}

/**
 * Format a Gherkin parse error
 * 
 * @param uri - URI of the feature file
 * @param line - Line number where the error occurred
 * @param column - Column number where the error occurred
 * @param message - Error message
 * @param options - Formatting options
 * @returns Formatted error message
 */
export function formatGherkinParseError(
  uri: string,
  line: number,
  column: number,
  message: string,
  options: ErrorFormatterOptions = {}
): string {
  const { colors = true } = options;
  
  const location = `${uri}:${line}:${column}`;
  
  if (colors) {
    return `\x1b[31mParse error in "${location}"\x1b[0m\n\n${message}`;
  } else {
    return `Parse error in "${location}"\n\n${message}`;
  }
}

/**
 * Format a step definition error
 * 
 * @param stepText - Text of the step that failed
 * @param scenarioName - Name of the scenario
 * @param featurePath - Path to the feature file
 * @param line - Line number where the step is defined
 * @param error - Error that occurred
 * @param options - Formatting options
 * @returns Formatted error message
 */
export function formatStepError(
  stepText: string,
  scenarioName: string,
  featurePath: string,
  line: number,
  error: Error | string,
  options: ErrorFormatterOptions = {}
): string {
  const { colors = true } = options;
  
  const errorMessage = typeof error === 'string' ? error : error.message;
  const location = `${featurePath}:${line}`;
  
  let formattedMessage = '';
  
  if (colors) {
    formattedMessage += `\x1b[31mFailed step: "${stepText}"\x1b[0m\n`;
    formattedMessage += `\x1b[90mScenario: ${scenarioName}\x1b[0m\n`;
    formattedMessage += `\x1b[90mLocation: ${location}\x1b[0m\n\n`;
    formattedMessage += `\x1b[31m${errorMessage}\x1b[0m`;
  } else {
    formattedMessage += `Failed step: "${stepText}"\n`;
    formattedMessage += `Scenario: ${scenarioName}\n`;
    formattedMessage += `Location: ${location}\n\n`;
    formattedMessage += errorMessage;
  }
  
  // Add the stack trace if available
  if (typeof error !== 'string' && error.stack) {
    formattedMessage += '\n\n' + error.stack;
  }
  
  return formattedMessage;
}

/**
 * Create a box around a message
 * 
 * @param message - Message to put in a box
 * @param options - Formatting options
 * @returns Boxed message
 */
export function createMessageBox(
  message: string,
  options: ErrorFormatterOptions = {}
): string {
  const { colors = true } = options;
  
  const lines = message.split('\n');
  const width = Math.max(...lines.map(line => line.length));
  
  const top = '┌' + '─'.repeat(width + 2) + '┐';
  const bottom = '└' + '─'.repeat(width + 2) + '┘';
  
  const boxedLines = lines.map(line => {
    const padding = ' '.repeat(width - line.length);
    return `│ ${line}${padding} │`;
  });
  
  const boxedMessage = [top, ...boxedLines, bottom].join('\n');
  
  if (colors) {
    return `\x1b[31m${boxedMessage}\x1b[0m`;
  } else {
    return boxedMessage;
  }
} 