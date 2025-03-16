/**
 * Tests for the source mapper utility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SourceMapper } from '../../src/utils/source-mapper.js';

// Mock the source-map module
vi.mock('source-map', () => {
  return {
    SourceMapConsumer: vi.fn().mockImplementation(() => {
      return {
        originalPositionFor: vi.fn().mockImplementation(({ line, column }) => {
          // Simulate mapping from generated to original position
          if (line === 10 && column === 20) {
            return {
              source: 'original-file.feature',
              line: 5,
              column: 10,
              name: 'originalFunction'
            };
          }
          
          // Default mapping
          return {
            source: 'original-file.js',
            line: line - 1,
            column: column - 1,
            name: null
          };
        }),
        
        sourceContentFor: vi.fn().mockImplementation((source) => {
          if (source === 'original-file.feature') {
            return 'Feature: Test feature\n  Scenario: Test scenario\n    Given a step\n    When another step\n    Then a verification step';
          }
          
          return `console.log('This is source content for ${source}');`;
        })
      };
    })
  };
});

describe('SourceMapper', () => {
  let sourceMapper: SourceMapper;
  let mockLogger: ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    mockLogger = vi.fn();
    sourceMapper = new SourceMapper({ 
      logger: mockLogger,
      includeSourceContent: true 
    });
  });
  
  afterEach(() => {
    sourceMapper.dispose();
    vi.clearAllMocks();
  });
  
  describe('registerSourceMap', () => {
    it('should register a source map for a file', async () => {
      const filePath = 'test-file.js';
      const sourceMapContent = JSON.stringify({
        version: 3,
        sources: ['original-file.js'],
        names: [],
        mappings: 'AAAA'
      });
      
      await sourceMapper.registerSourceMap(filePath, sourceMapContent);
      
      // We can't directly test the internal state, but we can test that it doesn't throw
      expect(mockLogger).not.toHaveBeenCalled();
    });
    
    it('should log an error if the source map is invalid', async () => {
      const filePath = 'test-file.js';
      const sourceMapContent = 'invalid-json';
      
      await sourceMapper.registerSourceMap(filePath, sourceMapContent);
      
      expect(mockLogger).toHaveBeenCalledWith(expect.stringContaining('Error registering source map'));
    });
  });
  
  describe('mapErrorStack', () => {
    it('should return the original error if it has no stack', async () => {
      const error = new Error('Test error');
      error.stack = undefined;
      
      const mappedError = await sourceMapper.mapErrorStack(error);
      
      expect(mappedError).toBe(error);
    });
    
    it('should map error stack traces to original source locations', async () => {
      // Create a source mapper
      const sourceMapper = new SourceMapper({
        includeSourceContent: true
      });
      
      // Register a source map
      await sourceMapper.registerSourceMap('/path/to/generated-file.js', JSON.stringify({
        version: 3,
        sources: ['original-file.feature'],
        names: ['originalFunction'],
        mappings: 'AAAA,SAASA,gBAAgB,CAAC,GAAG,EAAE;EAAE,OAAOA,GAAG,CAAC;AAAE',
        file: 'generated-file.js',
        sourceRoot: ''
      }));
      
      // Create an error with a stack trace
      const error = new Error('Test error');
      error.stack = `Error: Test error
    at testFunction (/path/to/generated-file.js:10:20)
    at Object.<anonymous> (/path/to/generated-file.js:15:25)`;
      
      // Map the error stack
      const mappedError = await sourceMapper.mapErrorStack(error);
      
      // Check that the stack trace was mapped
      expect(mappedError.stack).toContain('original-file.feature');
      
      // Import the error formatter module
      const errorFormatterModule = await import('../../src/utils/error-formatter.js');
      
      // Spy on the formatErrorWithMappedFrames function
      const formatErrorSpy = vi.spyOn(errorFormatterModule, 'formatErrorWithMappedFrames');
      
      // Map the error stack again
      await sourceMapper.mapErrorStack(error);
      
      // Verify the spy was called
      expect(formatErrorSpy).toHaveBeenCalled();
      expect(formatErrorSpy.mock.calls[0][0]).toBe(error);
      
      // Restore the spy
      formatErrorSpy.mockRestore();
    });
    
    it('should filter stack frames if filterStackTraces is true', async () => {
      // Create a source mapper with filterStacktraces enabled
      const sourceMapper = new SourceMapper({
        includeSourceContent: true,
        filterStacktraces: true
      });
      
      // Register a source map
      await sourceMapper.registerSourceMap('/path/to/generated-file.js', JSON.stringify({
        version: 3,
        sources: ['original-file.js'],
        names: [],
        mappings: 'AAAA'
      }));
      
      // Create an error with a stack trace that includes node_modules
      const error = new Error('Test error');
      error.stack = `Error: Test error
    at testFunction (/path/to/generated-file.js:10:20)
    at Object.<anonymous> (/path/to/node_modules/some-package/index.js:15:25)`;
      
      // Map the error stack
      const mappedError = await sourceMapper.mapErrorStack(error);
      
      // Check that the stack trace was filtered
      expect(mappedError.stack).not.toContain('node_modules');
    });
  });
}); 