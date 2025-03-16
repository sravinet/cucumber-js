import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HookRegistry, HookType } from '../../src/core/hook-registry.js';

describe('HookRegistry', () => {
  let hookRegistry: HookRegistry;
  
  beforeEach(() => {
    hookRegistry = new HookRegistry();
  });
  
  describe('register', () => {
    it('should register a hook with a function', () => {
      const fn = vi.fn();
      hookRegistry.register(HookType.Before, fn);
      
      const hooks = hookRegistry.getHooks(HookType.Before);
      expect(hooks).toHaveLength(1);
      expect(hooks[0].fn).toBe(fn);
      expect(hooks[0].options).toEqual({});
    });
    
    it('should register a hook with options and function', () => {
      const fn = vi.fn();
      hookRegistry.register(HookType.Before, { tags: '@smoke', timeout: 5000 }, fn);
      
      const hooks = hookRegistry.getHooks(HookType.Before);
      expect(hooks).toHaveLength(1);
      expect(hooks[0].fn).toBe(fn);
      expect(hooks[0].options).toEqual({ tags: '@smoke', timeout: 5000 });
    });
    
    it('should throw an error if options are provided without a function', () => {
      expect(() => {
        hookRegistry.register(HookType.Before, { tags: '@smoke' } as any);
      }).toThrow('Hook function is required when options are provided');
    });
  });
  
  describe('executeHooks', () => {
    it('should execute all hooks of a specific type', async () => {
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      
      hookRegistry.register(HookType.Before, fn1);
      hookRegistry.register(HookType.Before, fn2);
      
      await hookRegistry.executeHooks(HookType.Before, {});
      
      expect(fn1).toHaveBeenCalledTimes(1);
      expect(fn2).toHaveBeenCalledTimes(1);
    });
    
    it('should execute hooks with the provided world object', async () => {
      const world = { foo: 'bar' };
      const fn = vi.fn(function(this: any) {
        expect(this).toBe(world);
      });
      
      hookRegistry.register(HookType.Before, fn);
      
      await hookRegistry.executeHooks(HookType.Before, world);
      
      expect(fn).toHaveBeenCalledTimes(1);
    });
    
    it('should filter hooks based on tags', async () => {
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      const fn3 = vi.fn();
      
      hookRegistry.register(HookType.Before, fn1);
      hookRegistry.register(HookType.Before, { tags: '@smoke' }, fn2);
      hookRegistry.register(HookType.Before, { tags: '@regression' }, fn3);
      
      await hookRegistry.executeHooks(HookType.Before, {}, ['@smoke']);
      
      expect(fn1).toHaveBeenCalledTimes(1); // No tag filter, always runs
      expect(fn2).toHaveBeenCalledTimes(1); // Matches @smoke tag
      expect(fn3).toHaveBeenCalledTimes(0); // Doesn't match @smoke tag
    });
    
    it('should handle complex tag expressions', async () => {
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      
      hookRegistry.register(HookType.Before, { tags: '@smoke and not @slow' }, fn1);
      hookRegistry.register(HookType.Before, { tags: '@regression or @e2e' }, fn2);
      
      await hookRegistry.executeHooks(HookType.Before, {}, ['@smoke', '@fast']);
      
      expect(fn1).toHaveBeenCalledTimes(1); // Matches @smoke and not @slow
      expect(fn2).toHaveBeenCalledTimes(0); // Doesn't match @regression or @e2e
      
      await hookRegistry.executeHooks(HookType.Before, {}, ['@regression']);
      
      expect(fn1).toHaveBeenCalledTimes(1); // Still 1 from before
      expect(fn2).toHaveBeenCalledTimes(1); // Matches @regression
    });
    
    it('should enhance errors with hook information', async () => {
      const error = new Error('Something went wrong');
      const fn = vi.fn(() => {
        throw error;
      });
      
      hookRegistry.register(HookType.Before, fn);
      
      await expect(hookRegistry.executeHooks(HookType.Before, {})).rejects.toThrow('Hook failed: Something went wrong');
    });
  });
  
  describe('convenience methods', () => {
    it('should execute before hooks', async () => {
      const fn = vi.fn();
      hookRegistry.register(HookType.Before, fn);
      
      await hookRegistry.executeBeforeHooks({});
      
      expect(fn).toHaveBeenCalledTimes(1);
    });
    
    it('should execute after hooks', async () => {
      const fn = vi.fn();
      hookRegistry.register(HookType.After, fn);
      
      await hookRegistry.executeAfterHooks({});
      
      expect(fn).toHaveBeenCalledTimes(1);
    });
    
    it('should execute beforeAll hooks', async () => {
      const fn = vi.fn();
      hookRegistry.register(HookType.BeforeAll, fn);
      
      await hookRegistry.executeBeforeAllHooks({});
      
      expect(fn).toHaveBeenCalledTimes(1);
    });
    
    it('should execute afterAll hooks', async () => {
      const fn = vi.fn();
      hookRegistry.register(HookType.AfterAll, fn);
      
      await hookRegistry.executeAfterAllHooks({});
      
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
}); 