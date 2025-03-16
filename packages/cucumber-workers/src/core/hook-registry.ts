import { TagFilter } from './tag-filter.js';

/**
 * Hook options for registering hooks
 */
export interface HookOptions {
  /**
   * Tag expression to filter when the hook should run
   */
  tags?: string;
  
  /**
   * Timeout in milliseconds
   */
  timeout?: number;
}

/**
 * Hook function type
 */
export type HookFunction = (this: any, ...args: any[]) => void | Promise<void>;

/**
 * Hook definition with options and function
 */
interface HookDefinition {
  options: HookOptions;
  fn: HookFunction;
  tagFilter?: TagFilter;
}

/**
 * Hook types
 */
export enum HookType {
  Before = 'before',
  After = 'after',
  BeforeAll = 'beforeAll',
  AfterAll = 'afterAll'
}

/**
 * Registry for hooks
 */
export class HookRegistry {
  private hooks: Map<HookType, HookDefinition[]> = new Map();
  
  /**
   * Register a hook
   * @param type Hook type
   * @param optionsOrFn Hook options or function
   * @param fn Hook function if options are provided
   */
  register(type: HookType, optionsOrFn: HookOptions | HookFunction, fn?: HookFunction): void {
    // Initialize the hooks array for this type if it doesn't exist
    if (!this.hooks.has(type)) {
      this.hooks.set(type, []);
    }
    
    // Parse options and function
    let options: HookOptions = {};
    let hookFn: HookFunction;
    
    if (typeof optionsOrFn === 'function') {
      hookFn = optionsOrFn;
    } else {
      options = optionsOrFn;
      if (!fn) {
        throw new Error(`Hook function is required when options are provided`);
      }
      hookFn = fn;
    }
    
    // Create tag filter if tags are provided
    let tagFilter: TagFilter | undefined;
    if (options.tags) {
      tagFilter = new TagFilter(options.tags);
    }
    
    // Add the hook to the registry
    const hookDefinition: HookDefinition = {
      options,
      fn: hookFn,
      tagFilter
    };
    
    this.hooks.get(type)!.push(hookDefinition);
  }
  
  /**
   * Get hooks of a specific type
   * @param type Hook type
   * @returns Array of hook definitions
   */
  getHooks(type: HookType): HookDefinition[] {
    return this.hooks.get(type) || [];
  }
  
  /**
   * Execute hooks of a specific type
   * @param type Hook type
   * @param world World object
   * @param tags Tags for filtering
   * @returns Promise that resolves when all hooks have been executed
   */
  async executeHooks(type: HookType, world: any, tags: string[] = []): Promise<void> {
    const hooks = this.getHooks(type);
    
    for (const hook of hooks) {
      // Skip if tag filter doesn't match
      if (hook.tagFilter && !hook.tagFilter.evaluate(tags)) {
        continue;
      }
      
      try {
        // Execute the hook with the world as 'this'
        await hook.fn.call(world);
      } catch (error) {
        // Enhance error with hook information
        const enhancedError = error instanceof Error ? error : new Error(String(error));
        enhancedError.message = `Hook failed: ${enhancedError.message}`;
        throw enhancedError;
      }
    }
  }
  
  /**
   * Execute before hooks
   * @param world World object
   * @param tags Tags for filtering
   */
  async executeBeforeHooks(world: any, tags: string[] = []): Promise<void> {
    await this.executeHooks(HookType.Before, world, tags);
  }
  
  /**
   * Execute after hooks
   * @param world World object
   * @param tags Tags for filtering
   */
  async executeAfterHooks(world: any, tags: string[] = []): Promise<void> {
    await this.executeHooks(HookType.After, world, tags);
  }
  
  /**
   * Execute beforeAll hooks
   * @param world World object
   */
  async executeBeforeAllHooks(world: any): Promise<void> {
    await this.executeHooks(HookType.BeforeAll, world);
  }
  
  /**
   * Execute afterAll hooks
   * @param world World object
   */
  async executeAfterAllHooks(world: any): Promise<void> {
    await this.executeHooks(HookType.AfterAll, world);
  }
} 