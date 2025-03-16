/**
 * Tests for the Vitest integration
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCucumberTest, runCucumberInVitest } from '../src/vitest.js';

// Mock the workers-runtime-adapter module
vi.mock('../src/adapters/workers-runtime-adapter.js', () => ({
  runCucumberInWorkers: vi.fn().mockImplementation(() => Promise.resolve({
    success: true,
    summary: {
      total: 2,
      passed: 2,
      failed: 0,
      skipped: 0,
      pending: 0
    }
  }))
}));

// Mock the feature-loader module
vi.mock('../src/core/feature-loader.js', () => ({
  WorkersFeatureLoader: vi.fn().mockImplementation(() => ({
    register: vi.fn()
  }))
}));

// Mock the formatters
vi.mock('../src/formatters/basic-formatter.js', () => ({
  BasicFormatter: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    end: vi.fn()
  }))
}));

vi.mock('../src/formatters/progress-formatter.js', () => ({
  ProgressFormatter: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    end: vi.fn()
  }))
}));

vi.mock('../src/formatters/summary-formatter.js', () => ({
  SummaryFormatter: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    end: vi.fn()
  }))
}));

vi.mock('../src/formatters/json-formatter.js', () => ({
  JsonFormatter: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    end: vi.fn()
  }))
}));

// Mock the source-mapper module
vi.mock('../src/utils/source-mapper.js', () => ({
  SourceMapper: vi.fn().mockImplementation(() => ({
    registerSourceMap: vi.fn(),
    mapErrorStack: vi.fn().mockImplementation(error => error),
    dispose: vi.fn()
  }))
}));

describe('VitestIntegration', () => {
  let testFn: ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    testFn = vi.fn();
    vi.clearAllMocks();
  });
  
  it('should create a Cucumber test in Vitest', async () => {
    // Arrange
    const options = {
      name: 'Test Cucumber',
      features: ['features/test.feature'],
      worldParameters: { debug: true },
      runtime: {
        dryRun: true,
        useSourceMaps: true
      }
    };
    
    // Act
    createCucumberTest(testFn, options);
    
    // Assert
    expect(testFn).toHaveBeenCalledWith('Test Cucumber', expect.any(Function));
    
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
          worldParameters: { debug: true }
        },
        runtime: {
          dryRun: true,
          useSourceMaps: true
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
        worldParameters: { debug: true }
      },
      runtime: {
        dryRun: true,
        useSourceMaps: true
      }
    };
    
    const runtime = {
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
      env: {},
      fetch: vi.fn()
    };
    
    // Act
    const result = await runCucumberInVitest(options, runtime);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.summary.total).toBe(2);
    expect(result.summary.passed).toBe(2);
  });
  
  it('should throw an error when the test run fails', async () => {
    // Arrange
    const options = {
      name: 'Test Cucumber',
      features: ['features/test.feature'],
      worldParameters: { debug: true }
    };
    
    // Mock the runCucumberInWorkers function to return a failed result
    const { runCucumberInWorkers } = await import('../src/adapters/workers-runtime-adapter.js');
    vi.mocked(runCucumberInWorkers).mockImplementationOnce(() => Promise.resolve({
      success: false,
      summary: {
        total: 2,
        passed: 1,
        failed: 1,
        skipped: 0,
        pending: 0
      }
    }));
    
    // Act
    createCucumberTest(testFn, options);
    
    // Execute the test function and expect it to throw
    const testFunction = testFn.mock.calls[0][1];
    await expect(testFunction()).rejects.toThrow('Cucumber test failed: 1 of 2 scenarios failed');
  });
}); 