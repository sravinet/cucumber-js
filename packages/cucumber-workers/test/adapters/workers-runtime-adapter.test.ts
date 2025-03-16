/**
 * Tests for the Workers Runtime Adapter
 */
import { describe, it, expect } from 'vitest';
import { runCucumberInWorkers, type WorkersRuntime } from '../../src/adapters/workers-runtime-adapter.js';

describe('WorkersRuntimeAdapter', () => {
  it('should run Cucumber in Workers environment', async () => {
    // Arrange
    const runtime: WorkersRuntime = {
      console: {
        log: () => {},
        error: () => {},
        warn: () => {},
        info: () => {},
        debug: () => {},
        stdout: {
          write: () => {}
        },
        stderr: {
          write: () => {}
        }
      },
      env: {
        NODE_ENV: 'test'
      },
      fetch: globalThis.fetch
    };
    
    const options = {
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
    };
    
    // Act
    const result = await runCucumberInWorkers(options, runtime);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.summary).toBeDefined();
    expect(result.summary.total).toBe(0); // Since this is a placeholder implementation
  });
  
  it('should handle runtime options', async () => {
    // Arrange
    const runtime: WorkersRuntime = {
      console: {
        log: () => {},
        error: () => {},
        warn: () => {},
        info: () => {},
        debug: () => {},
        stdout: {
          write: () => {}
        },
        stderr: {
          write: () => {}
        }
      },
      env: {
        NODE_ENV: 'test'
      },
      fetch: globalThis.fetch
    };
    
    const options = {
      features: {
        paths: ['features/test.feature']
      },
      support: {},
      runtime: {
        dryRun: true,
        failFast: true,
        filterStacktraces: true
      }
    };
    
    // Act
    const result = await runCucumberInWorkers(options, runtime);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
}); 