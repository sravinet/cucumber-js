/**
 * Tests for the WorkersStepRegistry class
 */
import { describe, it, expect } from 'vitest';
import { ParameterTypeRegistry } from '@cucumber/cucumber-expressions';
import { WorkersStepRegistry } from '../../src/core/step-registry.js';

describe('WorkersStepRegistry', () => {
  it('should register and find a step definition with a string pattern', () => {
    // Arrange
    const registry = new WorkersStepRegistry();
    const pattern = 'I have {int} cucumbers';
    const fn = (count: number) => count;
    
    // Act
    registry.register(pattern, fn);
    const match = registry.findMatchingStep('I have 5 cucumbers');
    
    // Assert
    expect(match).toBeDefined();
    expect(match?.args).toEqual([5]);
    expect(match?.definition.pattern).toBe(pattern);
    expect(match?.definition.fn).toBe(fn);
  });
  
  it('should register and find a step definition with a regex pattern', () => {
    // Arrange
    const registry = new WorkersStepRegistry();
    const pattern = /I have (\d+) cucumbers/;
    const fn = (count: string) => parseInt(count, 10);
    
    // Act
    registry.register(pattern, fn);
    const match = registry.findMatchingStep('I have 5 cucumbers');
    
    // Assert
    expect(match).toBeDefined();
    expect(match?.args).toEqual([5]);
    expect(match?.definition.pattern).toBe(pattern);
    expect(match?.definition.fn).toBe(fn);
  });
  
  it('should return undefined when no matching step is found', () => {
    // Arrange
    const registry = new WorkersStepRegistry();
    registry.register('I have {int} cucumbers', (count: number) => count);
    
    // Act
    const match = registry.findMatchingStep('I have no cucumbers');
    
    // Assert
    expect(match).toBeUndefined();
  });
  
  it('should execute a step with the given world context', async () => {
    // Arrange
    const registry = new WorkersStepRegistry();
    const world = { count: 0 };
    registry.register('I have {int} cucumbers', function(this: typeof world, count: number) {
      this.count = count;
      return count;
    });
    
    // Act
    const result = await registry.executeStep('I have 5 cucumbers', world);
    
    // Assert
    expect(result).toBe(5);
    expect(world.count).toBe(5);
  });
  
  it('should throw an error when executing a non-existent step', async () => {
    // Arrange
    const registry = new WorkersStepRegistry();
    
    // Act & Assert
    await expect(registry.executeStep('I have 5 cucumbers', {}))
      .rejects.toThrow('No matching step definition found');
  });
  
  it('should get all registered step definitions', () => {
    // Arrange
    const registry = new WorkersStepRegistry();
    const pattern1 = 'I have {int} cucumbers';
    const fn1 = (count: number) => count;
    const pattern2 = 'I eat {int} cucumbers';
    const fn2 = (count: number) => count;
    
    // Act
    registry.register(pattern1, fn1);
    registry.register(pattern2, fn2);
    const definitions = registry.getAllDefinitions();
    
    // Assert
    expect(definitions).toHaveLength(2);
    expect(definitions).toEqual([
      { pattern: pattern1, fn: fn1 },
      { pattern: pattern2, fn: fn2 }
    ]);
  });
  
  it('should use a custom parameter type registry', () => {
    // Arrange
    const parameterTypeRegistry = new ParameterTypeRegistry();
    const registry = new WorkersStepRegistry(parameterTypeRegistry);
    const pattern = 'I have {int} cucumbers';
    const fn = (count: number) => count;
    
    // Act
    registry.register(pattern, fn);
    const match = registry.findMatchingStep('I have 5 cucumbers');
    
    // Assert
    expect(match).toBeDefined();
    expect(match?.args).toEqual([5]);
  });
}); 