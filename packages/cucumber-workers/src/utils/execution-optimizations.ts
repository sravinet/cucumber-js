/**
 * Execution time optimization utilities for Cucumber Workers
 * 
 * This module provides utilities to optimize execution time in the Workers environment,
 * which has stricter time limits than Node.js.
 */

/**
 * Runs tasks in parallel with a concurrency limit
 * @param tasks An array of tasks to run
 * @param concurrency The maximum number of tasks to run in parallel
 * @returns A promise that resolves to an array of results
 */
export async function runWithConcurrencyLimit<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number = 4
): Promise<T[]> {
  const results: T[] = [];
  const runningTasks: Promise<void>[] = [];
  let taskIndex = 0;

  // Helper function to run a task and track its completion
  const runTask = async (): Promise<void> => {
    if (taskIndex >= tasks.length) return;
    
    const currentTaskIndex = taskIndex++;
    const task = tasks[currentTaskIndex];
    
    try {
      const result = await task();
      results[currentTaskIndex] = result;
    } catch (error) {
      results[currentTaskIndex] = error as any;
    }
  };

  // Start initial batch of tasks
  for (let i = 0; i < Math.min(concurrency, tasks.length); i++) {
    runningTasks.push(runTask());
  }

  // As tasks complete, start new ones until all are done
  while (taskIndex < tasks.length) {
    await Promise.race(runningTasks);
    runningTasks.push(runTask());
  }

  // Wait for any remaining tasks
  await Promise.all(runningTasks);

  return results;
}

/**
 * Measures the execution time of a function
 * @param fn The function to measure
 * @param args The arguments to pass to the function
 * @returns A promise that resolves to the result and execution time
 */
export async function measureExecutionTime<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T> | T,
  ...args: Args
): Promise<{ result: T; executionTime: number }> {
  const startTime = performance.now();
  const result = await fn(...args);
  const endTime = performance.now();
  
  return {
    result,
    executionTime: endTime - startTime
  };
}

/**
 * Runs a function with a timeout
 * @param fn The function to run
 * @param timeoutMs The timeout in milliseconds
 * @param args The arguments to pass to the function
 * @returns A promise that resolves to the result or rejects with a timeout error
 */
export async function runWithTimeout<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T> | T,
  timeoutMs: number,
  ...args: Args
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Execution timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    
    Promise.resolve(fn(...args))
      .then(result => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

/**
 * Memoizes a function to cache its results
 * @param fn The function to memoize
 * @param keyFn A function that generates a cache key from the arguments
 * @returns A memoized version of the function
 */
export function memoize<T, Args extends any[]>(
  fn: (...args: Args) => T,
  keyFn: (...args: Args) => string = (...args) => JSON.stringify(args)
): (...args: Args) => T {
  const cache = new Map<string, T>();
  
  return (...args: Args): T => {
    const key = keyFn(...args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Memoizes an async function to cache its results
 * @param fn The async function to memoize
 * @param keyFn A function that generates a cache key from the arguments
 * @returns A memoized version of the async function
 */
export function memoizeAsync<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  keyFn: (...args: Args) => string = (...args) => JSON.stringify(args)
): (...args: Args) => Promise<T> {
  const cache = new Map<string, T>();
  const inProgress = new Map<string, Promise<T>>();
  
  return async (...args: Args): Promise<T> => {
    const key = keyFn(...args);
    
    // If we already have the result, return it
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    // If this calculation is already in progress, return the existing promise
    if (inProgress.has(key)) {
      return inProgress.get(key)!;
    }
    
    // Start the calculation and cache the promise
    const resultPromise = fn(...args).then(result => {
      cache.set(key, result);
      inProgress.delete(key);
      return result;
    }).catch(error => {
      inProgress.delete(key);
      throw error;
    });
    
    // Store the promise in the inProgress map before returning it
    inProgress.set(key, resultPromise);
    return resultPromise;
  };
}

/**
 * Prioritizes tasks based on a priority function
 * @param tasks An array of tasks to run
 * @param priorityFn A function that returns the priority of a task (higher is more important)
 * @returns A promise that resolves to an array of results in the original order
 */
export async function runWithPriority<T>(
  tasks: (() => Promise<T>)[],
  priorityFn: (task: () => Promise<T>, index: number) => number
): Promise<T[]> {
  // Create a priority queue
  const queue = tasks.map((task, index) => ({
    task,
    index,
    priority: priorityFn(task, index)
  })).sort((a, b) => b.priority - a.priority);
  
  const results: T[] = new Array(tasks.length);
  
  // Run tasks in priority order
  for (const { task, index } of queue) {
    results[index] = await task();
  }
  
  return results;
}

/**
 * Splits a large task into smaller chunks to avoid blocking the event loop
 * @param items The items to process
 * @param chunkSize The number of items to process in each chunk
 * @param processor A function that processes a single item
 * @returns A promise that resolves when all items are processed
 */
export async function processInChunks<T, R>(
  items: T[],
  chunkSize: number,
  processor: (item: T) => Promise<R> | R
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    
    // Process each chunk with a small delay to allow other tasks to run
    await new Promise(resolve => setTimeout(resolve, 0));
    
    const chunkResults = await Promise.all(
      chunk.map(item => processor(item))
    );
    
    results.push(...chunkResults);
  }
  
  return results;
}

/**
 * Executes a function with exponential backoff retry logic
 * @param fn The function to execute
 * @param options Retry options
 * @returns A promise that resolves to the function result
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    backoffFactor?: number;
    retryableErrors?: (error: any) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 100,
    maxDelayMs = 5000,
    backoffFactor = 2,
    retryableErrors = () => true
  } = options;
  
  let lastError: any;
  let delay = initialDelayMs;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt >= maxRetries || !retryableErrors(error)) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Increase delay for next attempt, but don't exceed maxDelayMs
      delay = Math.min(delay * backoffFactor, maxDelayMs);
    }
  }
  
  throw lastError;
}

/**
 * Aborts a function execution if it takes too long
 * @param fn The function to execute
 * @param timeoutMs The timeout in milliseconds
 * @returns A promise that resolves to the function result or rejects with a timeout error
 */
export async function executeWithAbortSignal<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController();
  const { signal } = controller;
  
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  
  try {
    return await fn(signal);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Executes a function with a deadline
 * @param fn The function to execute
 * @param deadlineMs The deadline in milliseconds from now
 * @returns A promise that resolves to the function result
 */
export async function executeWithDeadline<T>(
  fn: (timeRemaining: () => number) => Promise<T>,
  deadlineMs: number
): Promise<T> {
  const startTime = performance.now();
  const deadline = startTime + deadlineMs;
  
  const timeRemaining = () => Math.max(0, deadline - performance.now());
  
  return await fn(timeRemaining);
} 