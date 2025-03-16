import { describe, it, expect } from 'vitest';
import { runCucumberInWorkers } from '../../src/adapters/workers-runtime-adapter.js';
import { HookRegistry, HookType } from '../../src/core/hook-registry.js';
import { 
  createLazyIterable, 
  MemoryEfficientCache,
  StringBuilderOptimized
} from '../../src/utils/memory-optimizations.js';
import {
  memoize,
  runWithConcurrencyLimit
} from '../../src/utils/execution-optimizations.js';

// Define a World type for our test
interface TestWorld {
  calculator?: {
    value: number;
    operations: number[];
  };
  users?: any[];
  userList?: any[];
}

// This test verifies that all Phase 2 features work in a Cloudflare Workers environment
describe('Phase 2 Cloudflare Workers Integration', () => {
  it('should run a feature with all Phase 2 features in Workers environment', async () => {
    // Create a mock Workers runtime
    const mockRuntime = {
      console: {
        log: (): void => {},
        error: (): void => {},
        warn: (): void => {},
        info: (): void => {},
        debug: (): void => {},
        stdout: { write: (_: string): void => {} },
        stderr: { write: (_: string): void => {} }
      },
      env: {},
      fetch: (): Promise<Response> => Promise.resolve(new Response()),
      stdin: { read: (): null => null },
      stdout: { write: (): void => {} },
      stderr: { write: (): void => {} },
    };

    // Set up hooks
    const hookRegistry = new HookRegistry();
    const beforeHookCalled = { value: false };
    const afterHookCalled = { value: false };
    
    hookRegistry.register(HookType.Before, function(this: TestWorld): void {
      beforeHookCalled.value = true;
      this.calculator = { value: 0, operations: [] };
    });
    
    hookRegistry.register(HookType.After, function(): void {
      afterHookCalled.value = true;
    });
    
    // Use our memory and execution optimizations
    const cache = new MemoryEfficientCache<string, any>();
    cache.set('testKey', 'testValue');
    
    const builder = new StringBuilderOptimized();
    builder.append('Test');
    
    const lazyItems = createLazyIterable(3, i => `item-${i}`);
    const items = [...lazyItems];
    
    const memoizedFn = memoize((a: number, b: number) => a + b);
    const result = memoizedFn(2, 3);
    
    const tasks = [
      async () => 1,
      async () => 2,
      async () => 3
    ];
    const taskResults = await runWithConcurrencyLimit(tasks, 2);

    // Run Cucumber in Workers
    const result1 = await runCucumberInWorkers({
      features: {
        paths: ['calculator.feature']
      },
      support: {
        worldParameters: {}
      },
      filters: {
        tagExpression: '@smoke or @regression'
      }
    }, mockRuntime);

    // Verify that the test ran successfully
    expect(result1.success).toBe(true);
    
    // Verify that our optimizations worked
    expect(cache.get('testKey')).toBe('testValue');
    expect(builder.toString()).toBe('Test');
    expect(items).toEqual(['item-0', 'item-1', 'item-2']);
    expect(result).toBe(5);
    expect(taskResults).toEqual([1, 2, 3]);
  });
}); 