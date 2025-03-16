/**
 * Tests for the WorkersFeatureLoader class
 */
import { describe, it, expect } from 'vitest';
import { WorkersFeatureLoader } from '../../src/core/feature-loader.js';

describe('WorkersFeatureLoader', () => {
  it('should register and load a feature file', async () => {
    // Arrange
    const loader = new WorkersFeatureLoader();
    const path = 'features/test.feature';
    const content = 'Feature: Test feature';
    
    // Act
    loader.register(path, content);
    const loadedContent = await loader.load(path);
    
    // Assert
    expect(loadedContent).toBe(content);
  });
  
  it('should throw an error when loading a non-existent feature file', async () => {
    // Arrange
    const loader = new WorkersFeatureLoader();
    const path = 'features/non-existent.feature';
    
    // Act & Assert
    await expect(loader.load(path)).rejects.toThrow('Feature file not found');
  });
  
  it('should check if a feature file exists', () => {
    // Arrange
    const loader = new WorkersFeatureLoader();
    const path = 'features/test.feature';
    const content = 'Feature: Test feature';
    
    // Act
    loader.register(path, content);
    
    // Assert
    expect(loader.exists(path)).toBe(true);
    expect(loader.exists('non-existent.feature')).toBe(false);
  });
  
  it('should register multiple feature files', () => {
    // Arrange
    const loader = new WorkersFeatureLoader();
    const features = [
      { path: 'features/test1.feature', content: 'Feature: Test feature 1' },
      { path: 'features/test2.feature', content: 'Feature: Test feature 2' }
    ];
    
    // Act
    loader.registerAll(features);
    
    // Assert
    expect(loader.exists('features/test1.feature')).toBe(true);
    expect(loader.exists('features/test2.feature')).toBe(true);
  });
  
  it('should get all registered feature files', () => {
    // Arrange
    const loader = new WorkersFeatureLoader();
    const features = [
      { path: 'features/test1.feature', content: 'Feature: Test feature 1' },
      { path: 'features/test2.feature', content: 'Feature: Test feature 2' }
    ];
    
    // Act
    loader.registerAll(features);
    const allFeatures = loader.getAllFeatures();
    
    // Assert
    expect(allFeatures).toHaveLength(2);
    expect(allFeatures).toEqual(expect.arrayContaining([
      { path: 'features/test1.feature', content: 'Feature: Test feature 1' },
      { path: 'features/test2.feature', content: 'Feature: Test feature 2' }
    ]));
  });
}); 