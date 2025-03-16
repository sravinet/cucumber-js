import { describe, it, expect, vi } from 'vitest';
import {
  runWithConcurrencyLimit,
  measureExecutionTime,
  runWithTimeout,
  memoize,
  memoizeAsync,
  runWithPriority,
  processInChunks,
  executeWithRetry,
  executeWithAbortSignal,
  executeWithDeadline
} from '../../src/utils/execution-optimizations.js';

describe('Execution Optimizations', () => {
  describe('runWithConcurrencyLimit', () => {
    it('should run tasks with a concurrency limit', async () => {
      const results: number[] = [];
      const tasks = [
        async () => { results.push(1); return 1; },
        async () => { results.push(2); return 2; },
        async () => { results.push(3); return 3; },
        async () => { results.push(4); return 4; },
        async () => { results.push(5); return 5; }
      ];
      
      const taskResults = await runWithConcurrencyLimit(tasks, 2);
      
      // Results should be in the original order
      expect(taskResults).toEqual([1, 2, 3, 4, 5]);
    });
    
    it('should handle errors in tasks', async () => {
      const tasks = [
        async () => 1,
        async () => { throw new Error('Task failed'); },
        async () => 3
      ];
      
      const results = await runWithConcurrencyLimit(tasks, 1);
      
      expect(results[0]).toBe(1);
      expect(results[1]).toBeInstanceOf(Error);
      expect(results[2]).toBe(3);
    });
  });
  
  describe('measureExecutionTime', () => {
    it('should measure the execution time of a function', async () => {
      const fn = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'result';
      };
      
      const { result, executionTime } = await measureExecutionTime(fn);
      
      expect(result).toBe('result');
      expect(executionTime).toBeGreaterThan(0);
    });
    
    it('should pass arguments to the function', async () => {
      const fn = async (a: number, b: number) => a + b;
      
      const { result } = await measureExecutionTime(fn, 2, 3);
      
      expect(result).toBe(5);
    });
  });
  
  describe('runWithTimeout', () => {
    it('should resolve with the function result if it completes in time', async () => {
      const fn = async () => 'result';
      
      const result = await runWithTimeout(fn, 100);
      
      expect(result).toBe('result');
    });
    
    it('should reject with a timeout error if the function takes too long', async () => {
      const fn = async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return 'result';
      };
      
      await expect(runWithTimeout(fn, 10)).rejects.toThrow('Execution timed out');
    });
    
    it('should pass arguments to the function', async () => {
      const fn = async (a: number, b: number) => a + b;
      
      const result = await runWithTimeout(fn, 100, 2, 3);
      
      expect(result).toBe(5);
    });
  });
  
  describe('memoize', () => {
    it('should cache function results', () => {
      const fn = vi.fn((a: number, b: number) => a + b);
      const memoizedFn = memoize(fn);
      
      expect(memoizedFn(2, 3)).toBe(5);
      expect(memoizedFn(2, 3)).toBe(5);
      expect(fn).toHaveBeenCalledTimes(1);
      
      expect(memoizedFn(3, 4)).toBe(7);
      expect(fn).toHaveBeenCalledTimes(2);
    });
    
    it('should use a custom key function if provided', () => {
      const fn = vi.fn((obj: { id: number }) => obj.id * 2);
      const keyFn = (obj: { id: number }) => `id-${obj.id}`;
      const memoizedFn = memoize(fn, keyFn);
      
      const obj1 = { id: 1 };
      const obj2 = { id: 1 }; // Different object, same ID
      
      expect(memoizedFn(obj1)).toBe(2);
      expect(memoizedFn(obj2)).toBe(2);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('memoizeAsync', () => {
    it('should cache async function results', async () => {
      const fn = vi.fn(async (a: number, b: number) => a + b);
      const memoizedFn = memoizeAsync(fn);
      
      expect(await memoizedFn(2, 3)).toBe(5);
      expect(await memoizedFn(2, 3)).toBe(5);
      expect(fn).toHaveBeenCalledTimes(1);
      
      expect(await memoizedFn(3, 4)).toBe(7);
      expect(fn).toHaveBeenCalledTimes(2);
    });
    
    it('should return the same promise for in-progress calculations', async () => {
      let resolvePromise: (value: number) => void;
      const promise = new Promise<number>(resolve => {
        resolvePromise = resolve;
      });
      
      const fn = vi.fn(async () => {
        return await promise;
      });
      
      const memoizedFn = memoizeAsync(fn);
      
      const promise1 = memoizedFn();
      const promise2 = memoizedFn();
      
      expect(promise1).toStrictEqual(promise2);
      expect(fn).toHaveBeenCalledTimes(1);
      
      resolvePromise!(42);
      
      expect(await promise1).toBe(42);
      expect(await promise2).toBe(42);
    });
  });
  
  describe('runWithPriority', () => {
    it('should run tasks in priority order', async () => {
      const executionOrder: number[] = [];
      
      const tasks = [
        async () => { executionOrder.push(1); return 1; },
        async () => { executionOrder.push(2); return 2; },
        async () => { executionOrder.push(3); return 3; }
      ];
      
      const priorityFn = (_: any, index: number) => {
        // Reverse priority (higher index = higher priority)
        return index;
      };
      
      const results = await runWithPriority(tasks, priorityFn);
      
      // Results should be in the original order
      expect(results).toEqual([1, 2, 3]);
      
      // Execution should be in priority order (reversed)
      expect(executionOrder).toEqual([3, 2, 1]);
    });
  });
  
  describe('processInChunks', () => {
    it('should process items in chunks', async () => {
      const items = [1, 2, 3, 4, 5, 6, 7];
      const chunkSize = 3;
      const processor = vi.fn(async (item: number) => item * 2);
      
      const results = await processInChunks(items, chunkSize, processor);
      
      expect(results).toEqual([2, 4, 6, 8, 10, 12, 14]);
      expect(processor).toHaveBeenCalledTimes(7);
    });
  });
  
  describe('executeWithRetry', () => {
    it('should retry failed operations', async () => {
      let attempts = 0;
      const fn = vi.fn(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      });
      
      const result = await executeWithRetry(fn, {
        maxRetries: 3,
        initialDelayMs: 10
      });
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });
    
    it('should fail after max retries', async () => {
      const fn = vi.fn(async () => {
        throw new Error('Persistent failure');
      });
      
      await expect(executeWithRetry(fn, {
        maxRetries: 2,
        initialDelayMs: 10
      })).rejects.toThrow('Persistent failure');
      
      expect(fn).toHaveBeenCalledTimes(3); // Initial attempt + 2 retries
    });
    
    it('should respect retryable errors filter', async () => {
      const fn = vi.fn(async () => {
        throw new Error('Non-retryable failure');
      });
      
      const retryableErrors = (error: any) => {
        return error.message !== 'Non-retryable failure';
      };
      
      await expect(executeWithRetry(fn, {
        maxRetries: 3,
        initialDelayMs: 10,
        retryableErrors
      })).rejects.toThrow('Non-retryable failure');
      
      expect(fn).toHaveBeenCalledTimes(1); // No retries
    });
  });
  
  describe('executeWithAbortSignal', () => {
    it('should pass an abort signal to the function', async () => {
      const fn = vi.fn(async (signal: AbortSignal) => {
        expect(signal).toBeInstanceOf(AbortSignal);
        return 'result';
      });
      
      const result = await executeWithAbortSignal(fn, 100);
      
      expect(result).toBe('result');
      expect(fn).toHaveBeenCalledTimes(1);
    });
    
    it('should abort the function if it takes too long', async () => {
      let aborted = false;
      
      const fn = async (signal: AbortSignal) => {
        signal.addEventListener('abort', () => {
          aborted = true;
        });
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
        if (signal.aborted) {
          throw new Error('Aborted');
        }
        
        return 'result';
      };
      
      await expect(executeWithAbortSignal(fn, 10)).rejects.toThrow('Aborted');
      expect(aborted).toBe(true);
    });
  });
  
  describe('executeWithDeadline', () => {
    it('should pass a timeRemaining function to the function', async () => {
      const fn = vi.fn(async (timeRemaining: () => number) => {
        expect(typeof timeRemaining).toBe('function');
        expect(timeRemaining()).toBeGreaterThan(0);
        return 'result';
      });
      
      const result = await executeWithDeadline(fn, 100);
      
      expect(result).toBe('result');
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
}); 