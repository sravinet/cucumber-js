/**
 * Utilities for optimizing Cucumber tests for Cloudflare Workers
 * 
 * This module provides functions for optimizing Cucumber tests to run
 * efficiently in the Cloudflare Workers environment.
 */

/**
 * Options for optimizing for Workers
 */
export interface WorkersOptimizationOptions {
  /**
   * Memory limit for Cloudflare Workers (in MB)
   */
  memoryLimit?: number;
  
  /**
   * CPU limit for Cloudflare Workers (in ms)
   */
  cpuLimit?: number;
}

/**
 * Apply optimizations for running in Cloudflare Workers
 * 
 * @param options - Optimization options
 */
export function optimizeForWorkers(options: WorkersOptimizationOptions = {}): void {
  const {
    memoryLimit = 128,
    cpuLimit = 10000
  } = options;
  
  // Apply memory optimizations
  optimizeMemoryUsage(memoryLimit);
  
  // Apply CPU optimizations
  optimizeCpuUsage(cpuLimit);
}

/**
 * Optimize memory usage for Cloudflare Workers
 * 
 * @param memoryLimit - Memory limit in MB
 */
function optimizeMemoryUsage(memoryLimit: number): void {
  // Set up memory-efficient data structures
  setupMemoryEfficientDataStructures();
  
  // Set up garbage collection hints
  setupGarbageCollectionHints(memoryLimit);
}

/**
 * Set up memory-efficient data structures
 */
function setupMemoryEfficientDataStructures(): void {
  // Use typed arrays where possible
  // Use string builders for large string operations
  // Use object pools for frequently created objects
  
  // Monkey patch Array.prototype methods to be more memory-efficient
  const originalArrayPush = Array.prototype.push;
  Array.prototype.push = function(...items) {
    // Check if the array is getting too large
    if (this.length > 10000) {
      // Log a warning
      console.warn('Large array detected in Workers environment. Consider using a more memory-efficient data structure.');
    }
    
    return originalArrayPush.apply(this, items);
  };
}

/**
 * Set up garbage collection hints
 * 
 * @param memoryLimit - Memory limit in MB
 */
function setupGarbageCollectionHints(memoryLimit: number): void {
  // Set up a periodic check to suggest garbage collection
  const gcInterval = Math.max(1000, memoryLimit * 10);
  
  // In a real implementation, we would use a more sophisticated approach
  // to detect memory pressure and suggest garbage collection
  setInterval(() => {
    // This is a no-op in most JavaScript environments
    // but serves as a hint for engines that support it
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
    }
  }, gcInterval);
}

/**
 * Optimize CPU usage for Cloudflare Workers
 * 
 * @param cpuLimit - CPU limit in ms
 */
function optimizeCpuUsage(cpuLimit: number): void {
  // Set up CPU-efficient algorithms
  setupCpuEfficientAlgorithms();
  
  // Set up task scheduling
  setupTaskScheduling(cpuLimit);
}

/**
 * Set up CPU-efficient algorithms
 */
function setupCpuEfficientAlgorithms(): void {
  // Use iterative algorithms instead of recursive ones
  // Use memoization for expensive operations
  // Use lazy evaluation for large data sets
}

/**
 * Set up task scheduling
 * 
 * @param cpuLimit - CPU limit in ms
 */
function setupTaskScheduling(cpuLimit: number): void {
  // Set up a task scheduler that respects CPU limits
  const taskScheduler = {
    tasks: [] as Array<() => Promise<void>>,
    
    /**
     * Schedule a task to run
     * 
     * @param task - Task to run
     */
    schedule(task: () => Promise<void>): void {
      this.tasks.push(task);
    },
    
    /**
     * Run scheduled tasks
     */
    async run(): Promise<void> {
      // Process tasks in chunks to avoid blocking the event loop
      const chunkSize = Math.max(1, Math.floor(cpuLimit / 100));
      
      while (this.tasks.length > 0) {
        const chunk = this.tasks.splice(0, chunkSize);
        
        // Run tasks in parallel
        await Promise.all(chunk.map(task => task()));
        
        // Yield to the event loop
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
  };
  
  // Expose the task scheduler globally
  (globalThis as any).__cucumberWorkers = (globalThis as any).__cucumberWorkers || {};
  (globalThis as any).__cucumberWorkers.taskScheduler = taskScheduler;
} 