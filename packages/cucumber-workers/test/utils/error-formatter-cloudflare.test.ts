/**
 * Tests for the error formatter in Cloudflare Workers environment
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { Miniflare } from 'miniflare';
import { formatError, formatStepError, formatGherkinParseError, createMessageBox } from '../../src/utils/error-formatter.js';
import { SourceMapper } from '../../src/utils/source-mapper.js';

describe('ErrorFormatter in Cloudflare environment', () => {
  let miniflare: Miniflare;

  // Set up Miniflare before each test
  beforeEach(async () => {
    // Create a new Miniflare instance for each test
    miniflare = new Miniflare({
      modules: true,
      script: `
        export default {
          async fetch(request, env) {
            return new Response("Miniflare is running");
          }
        }
      `,
      // Simulate Cloudflare Workers environment
      compatibilityDate: '2023-12-01',
    });
    
    // Verify Miniflare is running
    const response = await miniflare.dispatchFetch('http://localhost/');
    expect(await response.text()).toBe("Miniflare is running");
  });

  it('should format basic errors', async () => {
    // Create a test error
    const error = new Error('Test error message');
    
    // Format the error
    const formattedError = formatError(error);
    
    // Verify the formatted error
    expect(formattedError).toContain('Test error message');
    expect(formattedError).toContain(error.stack);
  });

  it('should format step errors with context information', async () => {
    // Create a test error
    const error = new Error('Expected result to be 120, but got 121');
    
    // Format the step error
    const formattedError = formatStepError(
      'the result should be 120 on the screen',
      'Add two numbers',
      'features/calculator.feature',
      10,
      error,
      { colors: false }
    );
    
    // Verify the formatted error
    expect(formattedError).toContain('Failed step: "the result should be 120 on the screen"');
    expect(formattedError).toContain('Scenario: Add two numbers');
    expect(formattedError).toContain('Location: features/calculator.feature:10');
    expect(formattedError).toContain('Expected result to be 120, but got 121');
  });

  it('should format Gherkin parse errors', async () => {
    // Format a Gherkin parse error
    const formattedError = formatGherkinParseError(
      'features/calculator.feature',
      5,
      10,
      'Unexpected token',
      { colors: false }
    );
    
    // Verify the formatted error
    expect(formattedError).toContain('Parse error in "features/calculator.feature:5:10"');
    expect(formattedError).toContain('Unexpected token');
  });

  it('should create message boxes', async () => {
    // Create a message box
    const messageBox = createMessageBox(
      'Undefined. Implement this step in your code.',
      { colors: false }
    );
    
    // Verify the message box
    expect(messageBox).toContain('┌');
    expect(messageBox).toContain('└');
    expect(messageBox).toContain('│');
    expect(messageBox).toContain('Undefined. Implement this step in your code.');
  });

  it('should work with the source mapper', async () => {
    // Create a source mapper
    const sourceMapper = new SourceMapper({
      includeSourceContent: true,
      filterStacktraces: true
    });
    
    // Create a test error
    const error = new Error('Test error in mapped source');
    error.stack = `Error: Test error in mapped source
    at Object.<anonymous> (/path/to/generated/file.js:10:20)
    at Module._compile (internal/modules/cjs/loader.js:1085:14)`;
    
    // Map the error stack
    const mappedError = await sourceMapper.mapErrorStack(error);
    
    // Verify the mapped error
    expect(mappedError.message).toBe('Test error in mapped source');
    expect(mappedError.stack).toBeDefined();
  });
}); 