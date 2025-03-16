/**
 * Tests for the Workers Runtime Adapter in a Cloudflare Workers environment
 */
import { Miniflare } from 'miniflare';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { runCucumberInWorkers, type WorkersRuntime } from '../../src/adapters/workers-runtime-adapter.js';

describe('WorkersRuntimeAdapter in Cloudflare environment', () => {
  let miniflare: Miniflare;
  let kvNamespace: any;

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
      kvNamespaces: ['CUCUMBER_RESULTS'],
      // Simulate Cloudflare Workers environment
      compatibilityDate: '2023-12-01',
    });

    // Get the KV namespace
    kvNamespace = await miniflare.getKVNamespace('CUCUMBER_RESULTS');
  });

  // Clean up after each test
  afterEach(async () => {
    // Clean up any KV entries
    const keys = await kvNamespace.list();
    for (const key of keys.keys) {
      await kvNamespace.delete(key.name);
    }
  });

  it('should run Cucumber in a Cloudflare Workers environment', async () => {
    // Arrange
    // eslint-disable-next-line no-console
    const runtime: WorkersRuntime = {
      console: {
        // eslint-disable-next-line no-console
        log: (...args: any[]) => console.log(...args),
        // eslint-disable-next-line no-console
        error: (...args: any[]) => console.error(...args),
        // eslint-disable-next-line no-console
        warn: (...args: any[]) => console.warn(...args),
        // eslint-disable-next-line no-console
        info: (...args: any[]) => console.info(...args),
        // eslint-disable-next-line no-console
        debug: (...args: any[]) => console.debug(...args),
        stdout: {
          // eslint-disable-next-line no-console
          write: (data: string) => console.log(data)
        },
        stderr: {
          // eslint-disable-next-line no-console
          write: (data: string) => console.error(data)
        }
      },
      env: {
        NODE_ENV: 'test',
        CLOUDFLARE_ENVIRONMENT: 'true'
      },
      fetch: globalThis.fetch
    };
    
    const options = {
      features: {
        paths: ['features/test.feature']
      },
      support: {
        worldParameters: {
          debug: true,
          kvNamespace: kvNamespace
        }
      },
      runtime: {
        dryRun: false
      },
      filters: {
        tagExpression: '@cloudflare'
      }
    };
    
    // Act
    const result = await runCucumberInWorkers(options, runtime);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.summary).toBeDefined();
    expect(result.summary.total).toBeGreaterThan(0);
  });
  
  it('should handle tag filtering in a Cloudflare Workers environment', async () => {
    // Arrange
    const runtime: WorkersRuntime = {
      console: {
        // eslint-disable-next-line no-console
        log: (...args: any[]) => console.log(...args),
        // eslint-disable-next-line no-console
        error: (...args: any[]) => console.error(...args),
        // eslint-disable-next-line no-console
        warn: (...args: any[]) => console.warn(...args),
        // eslint-disable-next-line no-console
        info: (...args: any[]) => console.info(...args),
        // eslint-disable-next-line no-console
        debug: (...args: any[]) => console.debug(...args),
        stdout: {
          // eslint-disable-next-line no-console
          write: (data: string) => console.log(data)
        },
        stderr: {
          // eslint-disable-next-line no-console
          write: (data: string) => console.error(data)
        }
      },
      env: {
        NODE_ENV: 'test',
        CLOUDFLARE_ENVIRONMENT: 'true'
      },
      fetch: globalThis.fetch
    };
    
    const options = {
      features: {
        paths: ['features/test.feature']
      },
      support: {
        worldParameters: {
          debug: true,
          kvNamespace: kvNamespace
        }
      },
      runtime: {
        dryRun: false
      },
      filters: {
        tagExpression: '@cloudflare and not @slow'
      }
    };
    
    // Act
    const result = await runCucumberInWorkers(options, runtime);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.summary).toBeDefined();
  });
}); 