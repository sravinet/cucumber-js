/**
 * Tests for the Vitest integration
 */
import { describe, it, expect, vi } from 'vitest';
import { createCucumberTest, runCucumberInVitest } from '../src/vitest.js';
import { WorkersRuntime } from '../src/adapters/workers-runtime-adapter.js';

// Mock the runCucumberInWorkers function
vi.mock('../src/adapters/workers-runtime-adapter.js', () => {
  return {
    runCucumberInWorkers: vi.fn().mockResolvedValue({
      success: true,
      summary: {
        total: 2,
        passed: 2,
        failed: 0,
        skipped: 0,
        pending: 0
      }
    }),
    WorkersRuntime: vi.fn()
  };
});

describe('VitestIntegration', () => {
  it('should create a Cucumber test in Vitest', async () => {
    // Arrange
    const testFn = vi.fn();
    
    // Act
    createCucumberTest(testFn, {
      name: 'Test cucumber',
      features: [
        {
          path: 'features/test.feature',
          content: 'Feature: Test feature'
        }
      ],
      worldParameters: {
        debug: true
      },
      runtime: {
        dryRun: true
      }
    });
    
    // Assert
    expect(testFn).toHaveBeenCalledWith('Test cucumber', expect.any(Function));
    
    // Execute the test function
    const testFunction = testFn.mock.calls[0][1];
    await testFunction();
    
    // Verify that runCucumberInWorkers was called with the correct options
    const { runCucumberInWorkers } = await import('../src/adapters/workers-runtime-adapter.js');
    expect(runCucumberInWorkers).toHaveBeenCalledWith(
      expect.objectContaining({
        features: {
          paths: ['features/test.feature']
        },
        support: {
          worldParameters: {
            debug: true
          }
        },
        runtime: {
          dryRun: true
        }
      }),
      expect.any(Object)
    );
  });
  
  it('should run Cucumber in Vitest', async () => {
    // Arrange
    const options = {
      features: {
        paths: ['features/test.feature']
      },
      support: {
        worldParameters: {
          debug: true
        }
      }
    };
    
    const runtime: WorkersRuntime = {
      console: {
        log: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
        stdout: {
          write: vi.fn()
        },
        stderr: {
          write: vi.fn()
        }
      },
      env: {
        NODE_ENV: 'test'
      },
      fetch: globalThis.fetch
    };
    
    // Act
    const result = await runCucumberInVitest(options, runtime);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.summary.total).toBe(2);
    expect(result.summary.passed).toBe(2);
    expect(result.summary.failed).toBe(0);
  });
  
  it('should throw an error when the test run fails', async () => {
    // Arrange
    const testFn = vi.fn();
    const { runCucumberInWorkers } = await import('../src/adapters/workers-runtime-adapter.js');
    
    // Mock a failed test run
    vi.mocked(runCucumberInWorkers).mockResolvedValueOnce({
      success: false,
      summary: {
        total: 2,
        passed: 1,
        failed: 1,
        skipped: 0,
        pending: 0
      }
    });
    
    // Act
    createCucumberTest(testFn, {
      name: 'Test cucumber',
      features: [
        {
          path: 'features/test.feature',
          content: 'Feature: Test feature'
        }
      ]
    });
    
    // Assert
    expect(testFn).toHaveBeenCalledWith('Test cucumber', expect.any(Function));
    
    // Execute the test function and expect it to throw
    const testFunction = testFn.mock.calls[0][1];
    await expect(testFunction()).rejects.toThrow('Cucumber test run failed with 1 failures');
  });
}); 