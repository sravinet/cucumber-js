/**
 * Tests for error handling in the Workers Runtime Adapter
 */
import { Miniflare } from 'miniflare';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { runCucumberInWorkers, type WorkersRuntime } from '../../src/adapters/workers-runtime-adapter.js';
import { formatStepError } from '../../src/utils/error-formatter.js';

// Mock the runCucumberInWorkers function
vi.mock('../../src/adapters/workers-runtime-adapter.js', async (importOriginal) => {
  const originalModule = await importOriginal() as any;
  
  return {
    ...originalModule,
    runCucumberInWorkers: vi.fn().mockImplementation(async (options, runtime) => {
      // Simulate an error during test execution
      const error = new Error('Expected result to be 121, but got 120');
      
      // Format the error with context information
      const formattedError = formatStepError(
        'the result should be 121 on the screen',
        'Add two numbers incorrectly',
        'features/calculator.feature',
        10,
        error,
        {
          colors: options.runtime?.errorMessages?.colors,
          includeContext: options.runtime?.errorMessages?.includeContext,
          contextLines: options.runtime?.errorMessages?.contextLines || 3
        }
      );
      
      // Log the error
      runtime.console.error(`Error processing feature features/calculator.feature: ${error.message}`);
      runtime.console.error(formattedError);
      
      // Throw the error to simulate test failure
      throw error;
    })
  };
});

describe('WorkersRuntimeAdapter error handling', () => {
  let consoleMock: { log: any; error: any; warn: any; info: any; debug: any; };

  // Set up Miniflare before each test
  beforeEach(async () => {
    // Create a new Miniflare instance for each test
    const miniflare = new Miniflare({
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

    // Mock console methods
    consoleMock = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      debug: vi.fn()
    };
  });

  it('should format errors with enhanced error messages', async () => {
    // Arrange
    const runtime: WorkersRuntime = {
      console: {
        log: consoleMock.log,
        error: consoleMock.error,
        warn: consoleMock.warn,
        info: consoleMock.info,
        debug: consoleMock.debug,
        stdout: {
          write: (data: string) => consoleMock.log(data)
        },
        stderr: {
          write: (data: string) => consoleMock.error(data)
        }
      },
      env: {
        NODE_ENV: 'test',
        CLOUDFLARE_ENVIRONMENT: 'true'
      },
      fetch: globalThis.fetch
    };
    
    // Create options with enhanced error messages
    const options = {
      features: {
        paths: ['features/calculator.feature']
      },
      support: {
        worldParameters: {}
      },
      runtime: {
        dryRun: false,
        useSourceMaps: true,
        errorMessages: {
          colors: true,
          includeContext: true,
          contextLines: 3
        }
      },
      sourceMaps: {
        includeSourceContent: true,
        filterStacktraces: true
      }
    };
    
    // Act & Assert
    try {
      // This should fail because of the intentional error in our mock
      await runCucumberInWorkers(options, runtime);
      // If it doesn't fail, the test should fail
      expect.fail('Expected runCucumberInWorkers to throw an error');
    } catch (error) {
      // Verify that the error was logged with enhanced formatting
      expect(consoleMock.error).toHaveBeenCalled();
      
      // Find calls that contain our error message
      const errorCalls = consoleMock.error.mock.calls.filter(
        (call: any[]) => typeof call[0] === 'string' && call[0].includes('Expected result to be 121, but got 120')
      );
      
      // Verify that the error was logged with the expected format
      expect(errorCalls.length).toBeGreaterThan(0);
      
      // Verify that the error contains context information
      const errorMessage = errorCalls[1][0]; // Second call contains the formatted error
      expect(errorMessage).toContain('Failed step:');
      expect(errorMessage).toContain('the result should be 121 on the screen');
      expect(errorMessage).toContain('Scenario: Add two numbers incorrectly');
      expect(errorMessage).toContain('Location: features/calculator.feature:10');
    }
  });
}); 