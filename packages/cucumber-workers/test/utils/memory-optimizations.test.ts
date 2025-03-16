import { describe, it, expect, vi } from 'vitest';
import {
  createLazyIterable,
  MemoryEfficientCache,
  StringBuilderOptimized,
  processBatches,
  createObjectPool,
  optimizeArrayMemory,
  MemoryTracker
} from '../../src/utils/memory-optimizations.js';

describe('Memory Optimizations', () => {
  describe('createLazyIterable', () => {
    it('should create an iterable that generates items on demand', () => {
      const size = 5;
      const generator = (index: number) => `item-${index}`;
      const iterable = createLazyIterable(size, generator);
      
      const items = [...iterable];
      expect(items).toEqual(['item-0', 'item-1', 'item-2', 'item-3', 'item-4']);
    });
    
    it('should not generate items beyond the specified size', () => {
      const size = 3;
      const generator = vi.fn((index: number) => `item-${index}`);
      const iterable = createLazyIterable(size, generator);
      
      const items = [...iterable];
      expect(items).toEqual(['item-0', 'item-1', 'item-2']);
      expect(generator).toHaveBeenCalledTimes(3);
    });
  });
  
  describe('MemoryEfficientCache', () => {
    it('should store and retrieve values', () => {
      const cache = new MemoryEfficientCache<string, number>();
      
      cache.set('one', 1);
      cache.set('two', 2);
      
      expect(cache.get('one')).toBe(1);
      expect(cache.get('two')).toBe(2);
      expect(cache.get('three')).toBeUndefined();
    });
    
    it('should evict least recently used items when full', () => {
      const cache = new MemoryEfficientCache<string, number>(2);
      
      cache.set('one', 1);
      cache.set('two', 2);
      cache.set('three', 3); // This should evict 'one'
      
      expect(cache.get('one')).toBeUndefined();
      expect(cache.get('two')).toBe(2);
      expect(cache.get('three')).toBe(3);
    });
    
    it('should update access order when getting items', () => {
      const cache = new MemoryEfficientCache<string, number>(2);
      
      cache.set('one', 1);
      cache.set('two', 2);
      
      // Access 'one' to make it the most recently used
      cache.get('one');
      
      // Add a new item, which should evict 'two' instead of 'one'
      cache.set('three', 3);
      
      expect(cache.get('one')).toBe(1);
      expect(cache.get('two')).toBeUndefined();
      expect(cache.get('three')).toBe(3);
    });
    
    it('should clear the cache', () => {
      const cache = new MemoryEfficientCache<string, number>();
      
      cache.set('one', 1);
      cache.set('two', 2);
      
      cache.clear();
      
      expect(cache.get('one')).toBeUndefined();
      expect(cache.get('two')).toBeUndefined();
      expect(cache.size).toBe(0);
    });
  });
  
  describe('StringBuilderOptimized', () => {
    it('should build strings efficiently', () => {
      const builder = new StringBuilderOptimized();
      
      builder.append('Hello');
      builder.append(' ');
      builder.append('World');
      
      expect(builder.toString()).toBe('Hello World');
      expect(builder.length).toBe(11);
    });
    
    it('should append lines', () => {
      const builder = new StringBuilderOptimized();
      
      builder.appendLine('Line 1');
      builder.appendLine('Line 2');
      
      expect(builder.toString()).toBe('Line 1\nLine 2\n');
    });
    
    it('should clear the builder', () => {
      const builder = new StringBuilderOptimized();
      
      builder.append('Hello World');
      builder.clear();
      
      expect(builder.toString()).toBe('');
      expect(builder.length).toBe(0);
    });
  });
  
  describe('processBatches', () => {
    it('should process items in batches', async () => {
      const items = [1, 2, 3, 4, 5, 6, 7];
      const batchSize = 3;
      const processor = async (batch: number[]) => batch.map(item => item * 2);
      
      const results = await processBatches(items, batchSize, processor);
      
      expect(results).toEqual([2, 4, 6, 8, 10, 12, 14]);
    });
  });
  
  describe('createObjectPool', () => {
    it('should create and reuse objects', () => {
      const factory = vi.fn(() => ({ value: 0 }));
      const reset = vi.fn((obj: { value: number }) => { obj.value = 0; });
      
      const pool = createObjectPool(factory, reset);
      
      // Acquire a new object
      const obj1 = pool.acquire();
      expect(factory).toHaveBeenCalledTimes(1);
      
      // Modify the object
      obj1.value = 42;
      
      // Release the object back to the pool
      pool.release(obj1);
      expect(reset).toHaveBeenCalledTimes(1);
      expect(obj1.value).toBe(0);
      
      // Acquire an object again (should be the same one)
      const obj2 = pool.acquire();
      expect(factory).toHaveBeenCalledTimes(1); // Factory should not be called again
      
      // The objects should be the same instance
      expect(obj2).toBe(obj1);
    });
  });
  
  describe('optimizeArrayMemory', () => {
    it('should return the original array for small arrays', () => {
      const array = [1, 2, 3];
      const optimized = optimizeArrayMemory(array);
      
      expect(optimized).toBe(array);
    });
    
    it('should convert arrays of integers to Int32Array', () => {
      // Create a large array of integers
      const array = Array.from({ length: 1000 }, (_, i) => i);
      const optimized = optimizeArrayMemory(array);
      
      expect(optimized).toBeInstanceOf(Int32Array);
      expect(Array.from(optimized as Int32Array)).toEqual(array);
    });
    
    it('should convert arrays of numbers to Float64Array', () => {
      // Create a large array of floating-point numbers
      const array = Array.from({ length: 1000 }, (_, i) => i + 0.5);
      const optimized = optimizeArrayMemory(array);
      
      expect(optimized).toBeInstanceOf(Float64Array);
      expect(Array.from(optimized as Float64Array)).toEqual(array);
    });
    
    it('should return the original array for mixed types', () => {
      // Create a large array of mixed types
      const array = Array.from({ length: 1000 }, (_, i) => i % 2 === 0 ? i : `item-${i}`);
      const optimized = optimizeArrayMemory(array);
      
      expect(optimized).toBe(array);
    });
  });
  
  describe('MemoryTracker', () => {
    it('should track allocations and deallocations', () => {
      const tracker = new MemoryTracker();
      
      tracker.trackAllocation('Object');
      tracker.trackAllocation('Object');
      tracker.trackAllocation('Array');
      
      const counts = tracker.getAllocationCounts();
      expect(counts.get('Object')).toBe(2);
      expect(counts.get('Array')).toBe(1);
      
      tracker.trackDeallocation('Object');
      
      const updatedCounts = tracker.getAllocationCounts();
      expect(updatedCounts.get('Object')).toBe(1);
      expect(updatedCounts.get('Array')).toBe(1);
    });
    
    it('should detect leaks', () => {
      const tracker = new MemoryTracker();
      
      tracker.trackAllocation('Object');
      expect(tracker.hasLeaks()).toBe(true);
      
      tracker.trackDeallocation('Object');
      expect(tracker.hasLeaks()).toBe(false);
    });
    
    it('should generate leak reports', () => {
      const tracker = new MemoryTracker();
      
      tracker.trackAllocation('Object');
      tracker.trackAllocation('Array');
      tracker.trackDeallocation('Array');
      
      const report = tracker.getLeakReport();
      expect(report).toContain('Object: 1');
      expect(report).not.toContain('Array');
    });
    
    it('should reset the tracker', () => {
      const tracker = new MemoryTracker();
      
      tracker.trackAllocation('Object');
      tracker.reset();
      
      expect(tracker.hasLeaks()).toBe(false);
      expect(tracker.getLeakReport()).toBe('No memory leaks detected');
    });
  });
}); 