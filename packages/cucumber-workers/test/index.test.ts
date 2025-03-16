/**
 * Tests for the main API
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Given, When, Then, defineParameterType, getRegistry } from '../src/index.js';

// Mock the WorkersStepRegistry
vi.mock('../src/core/step-registry.js', () => {
  const mockRegistry = {
    register: vi.fn(),
    getAllDefinitions: vi.fn().mockReturnValue([])
  };
  
  return {
    WorkersStepRegistry: vi.fn(() => mockRegistry)
  };
});

// Mock the cucumber-expressions module
vi.mock('@cucumber/cucumber-expressions', () => {
  const parameterTypeRegistry = {
    defineParameterType: vi.fn()
  };
  
  return {
    ParameterTypeRegistry: vi.fn().mockImplementation(() => parameterTypeRegistry),
    ParameterType: vi.fn((
      name: string, 
      regexp: RegExp, 
      type: any, 
      transformer: (s: string) => any, 
      useForSnippets: boolean, 
      preferForRegexpMatch: boolean
    ) => ({
      name,
      regexp,
      type,
      transformer,
      useForSnippets,
      preferForRegexpMatch
    }))
  };
});

describe('Main API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should register a Given step definition', () => {
    // Arrange
    const pattern = 'I have {int} cucumbers';
    const fn = (count: number) => count;
    
    // Act
    Given(pattern, fn);
    
    // Assert
    const registry = getRegistry();
    expect(registry.register).toHaveBeenCalledWith(pattern, fn);
  });
  
  it('should register a When step definition', () => {
    // Arrange
    const pattern = 'I eat {int} cucumbers';
    const fn = (count: number) => count;
    
    // Act
    When(pattern, fn);
    
    // Assert
    const registry = getRegistry();
    expect(registry.register).toHaveBeenCalledWith(pattern, fn);
  });
  
  it('should register a Then step definition', () => {
    // Arrange
    const pattern = 'I should have {int} cucumbers left';
    const fn = (count: number) => count;
    
    // Act
    Then(pattern, fn);
    
    // Assert
    const registry = getRegistry();
    expect(registry.register).toHaveBeenCalledWith(pattern, fn);
  });
  
  it('should define a custom parameter type', async () => {
    // Act
    defineParameterType({
      name: 'cucumber',
      regexp: /cucumber/,
      transformer: (s: string) => s
    });
    
    // Assert
    const { ParameterType } = await import('@cucumber/cucumber-expressions');
    expect(ParameterType).toHaveBeenCalledWith(
      'cucumber',
      /cucumber/,
      null,
      expect.any(Function),
      true,
      false
    );
    
    const { ParameterTypeRegistry } = await import('@cucumber/cucumber-expressions');
    const mockRegistry = new ParameterTypeRegistry();
    expect(mockRegistry.defineParameterType).toHaveBeenCalled();
  });
}); 