/**
 * Memory optimization utilities for Cucumber Workers
 * 
 * This module provides utilities to optimize memory usage in the Workers environment,
 * which has stricter memory constraints than Node.js.
 */

/**
 * Creates a memory-efficient iterator for large data sets
 * Instead of loading all data into memory at once, this creates an iterator
 * that generates data on demand.
 * 
 * @param size The size of the data set
 * @param generator A function that generates an item at a specific index
 * @returns An iterable that generates items on demand
 */
export function createLazyIterable<T>(
  size: number,
  generator: (index: number) => T
): Iterable<T> {
  return {
    [Symbol.iterator]() {
      let index = 0;
      return {
        next() {
          if (index < size) {
            return { value: generator(index++), done: false };
          }
          return { value: undefined, done: true };
        }
      };
    }
  };
}

/**
 * A memory-efficient cache that limits the number of items stored
 * Uses LRU (Least Recently Used) strategy to evict items when the cache is full
 */
export class MemoryEfficientCache<K, V> {
  private cache = new Map<K, V>();
  private accessOrder: K[] = [];
  
  constructor(private maxSize: number = 100) {}
  
  /**
   * Get a value from the cache
   * @param key The key to look up
   * @returns The cached value or undefined if not found
   */
  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      // Move key to the end of the access order (most recently used)
      this.updateAccessOrder(key);
      return this.cache.get(key);
    }
    return undefined;
  }
  
  /**
   * Set a value in the cache
   * @param key The key to store
   * @param value The value to store
   */
  set(key: K, value: V): void {
    // If the cache is full and this is a new key, evict the least recently used item
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const lruKey = this.accessOrder[0];
      this.cache.delete(lruKey);
      this.accessOrder.shift();
    }
    
    this.cache.set(key, value);
    this.updateAccessOrder(key);
  }
  
  /**
   * Update the access order for a key
   * @param key The key that was accessed
   */
  private updateAccessOrder(key: K): void {
    const index = this.accessOrder.indexOf(key);
    if (index !== -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }
  
  /**
   * Clear the cache
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }
  
  /**
   * Get the number of items in the cache
   */
  get size(): number {
    return this.cache.size;
  }
}

/**
 * A memory-efficient string builder that minimizes allocations
 * Useful for building large strings in formatters
 */
export class StringBuilderOptimized {
  private chunks: string[] = [];
  private totalLength = 0;
  
  /**
   * Append a string to the builder
   * @param str The string to append
   * @returns This builder for chaining
   */
  append(str: string): StringBuilderOptimized {
    this.chunks.push(str);
    this.totalLength += str.length;
    return this;
  }
  
  /**
   * Append a string and a newline to the builder
   * @param str The string to append
   * @returns This builder for chaining
   */
  appendLine(str: string = ''): StringBuilderOptimized {
    return this.append(str + '\n');
  }
  
  /**
   * Convert the builder to a string
   * @returns The combined string
   */
  toString(): string {
    return this.chunks.join('');
  }
  
  /**
   * Get the current length of the string being built
   */
  get length(): number {
    return this.totalLength;
  }
  
  /**
   * Clear the builder
   */
  clear(): void {
    this.chunks = [];
    this.totalLength = 0;
  }
}

/**
 * A utility to batch operations to reduce memory pressure
 * @param items The items to process
 * @param batchSize The size of each batch
 * @param processor A function that processes a batch of items
 * @returns A promise that resolves when all batches are processed
 */
export async function processBatches<T, R>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processor(batch);
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Creates a memory-efficient object pool to reuse objects
 * instead of creating new ones
 * @param factory A function that creates a new object
 * @param reset A function that resets an object for reuse
 * @returns An object pool
 */
export function createObjectPool<T>(
  factory: () => T,
  reset: (obj: T) => void
): {
  acquire: () => T;
  release: (obj: T) => void;
  size: () => number;
} {
  const pool: T[] = [];
  
  return {
    acquire: () => {
      if (pool.length > 0) {
        return pool.pop()!;
      }
      return factory();
    },
    release: (obj: T) => {
      reset(obj);
      pool.push(obj);
    },
    size: () => pool.length
  };
}

/**
 * Optimizes memory usage for large arrays by using typed arrays where possible
 * @param data The data to optimize
 * @returns A memory-optimized version of the data
 */
export function optimizeArrayMemory<T>(data: T[]): T[] | Int32Array | Float64Array {
  // If the array is empty or small, just return it as is
  if (data.length < 1000) {
    return data;
  }
  
  // Check if all elements are integers within Int32 range
  const isAllInt32 = data.every(item => 
    typeof item === 'number' && 
    Number.isInteger(item) && 
    item >= -2147483648 && 
    item <= 2147483647
  );
  
  if (isAllInt32) {
    const typedArray = new Int32Array(data.length);
    for (let i = 0; i < data.length; i++) {
      typedArray[i] = data[i] as unknown as number;
    }
    return typedArray as unknown as T[];
  }
  
  // Check if all elements are numbers
  const isAllNumber = data.every(item => typeof item === 'number');
  
  if (isAllNumber) {
    const typedArray = new Float64Array(data.length);
    for (let i = 0; i < data.length; i++) {
      typedArray[i] = data[i] as unknown as number;
    }
    return typedArray as unknown as T[];
  }
  
  // If we can't optimize, return the original array
  return data;
}

/**
 * Utility to detect memory leaks by tracking object allocations
 * This is useful during development and testing
 */
export class MemoryTracker {
  private allocations = new Map<string, number>();
  
  /**
   * Track an object allocation
   * @param type The type of object being allocated
   */
  trackAllocation(type: string): void {
    const count = this.allocations.get(type) || 0;
    this.allocations.set(type, count + 1);
  }
  
  /**
   * Track an object deallocation
   * @param type The type of object being deallocated
   */
  trackDeallocation(type: string): void {
    const count = this.allocations.get(type) || 0;
    if (count > 0) {
      this.allocations.set(type, count - 1);
    }
  }
  
  /**
   * Get the current allocation counts
   * @returns A map of object types to allocation counts
   */
  getAllocationCounts(): Map<string, number> {
    return new Map(this.allocations);
  }
  
  /**
   * Reset the tracker
   */
  reset(): void {
    this.allocations.clear();
  }
  
  /**
   * Check if there are any potential memory leaks
   * @returns True if there are any non-zero allocation counts
   */
  hasLeaks(): boolean {
    for (const count of this.allocations.values()) {
      if (count > 0) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * Get a report of potential memory leaks
   * @returns A string report of allocation counts
   */
  getLeakReport(): string {
    const report: string[] = [];
    
    for (const [type, count] of this.allocations.entries()) {
      if (count > 0) {
        report.push(`${type}: ${count}`);
      }
    }
    
    if (report.length === 0) {
      return 'No memory leaks detected';
    }
    
    return `Potential memory leaks detected:\n${report.join('\n')}`;
  }
} 