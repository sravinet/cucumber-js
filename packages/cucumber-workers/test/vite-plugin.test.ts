/**
 * Tests for the Vite plugin
 */
import { describe, it, expect, vi } from 'vitest';
import { cucumberWorkers } from '../src/vite-plugin.js';

// Mock the gherkin Parser
vi.mock('@cucumber/gherkin', () => ({
  Parser: vi.fn().mockImplementation(() => ({
    parse: vi.fn().mockReturnValue({})
  }))
}));

// Mock the messages module
vi.mock('@cucumber/messages', () => ({
  incrementing: vi.fn().mockReturnValue(() => 'test-id')
}));

describe('VitePlugin', () => {
  it('should create a Vite plugin with default options', () => {
    // Act
    const plugin = cucumberWorkers();
    
    // Assert
    expect(plugin).toBeDefined();
    expect(plugin.name).toBe('vite-plugin-cucumber-workers');
    expect(plugin.transform).toBeDefined();
    expect(plugin.configureServer).toBeDefined();
    expect(plugin.generateBundle).toBeDefined();
  });
  
  it('should transform feature files into modules', () => {
    // Arrange
    const plugin = cucumberWorkers();
    const featureContent = 'Feature: Test feature';
    const id = 'features/test.feature';
    
    // Act
    const result = plugin.transform(featureContent, id);
    
    // Assert
    expect(result).toBeDefined();
    expect(result?.code).toContain(`export const path = "${id}"`);
    expect(result?.code).toContain(`export const content = "${featureContent}"`);
    expect(result?.map).toEqual({ mappings: '' });
  });
  
  it('should not transform non-feature files', () => {
    // Arrange
    const plugin = cucumberWorkers();
    const content = 'export const foo = "bar";';
    const id = 'src/foo.ts';
    
    // Act
    const result = plugin.transform(content, id);
    
    // Assert
    expect(result).toBeNull();
  });
  
  it('should configure Vite for Cucumber Workers', () => {
    // Arrange
    const plugin = cucumberWorkers();
    
    // Act
    const config = plugin.config();
    
    // Assert
    expect(config).toBeDefined();
    expect(config.resolve?.alias).toBeDefined();
    expect(config.optimizeDeps?.include).toContain('@cucumber/cucumber-expressions');
    expect(config.optimizeDeps?.include).toContain('@cucumber/gherkin');
    expect(config.optimizeDeps?.include).toContain('@cucumber/messages');
    expect(config.optimizeDeps?.include).toContain('@cucumber/tag-expressions');
  });
  
  it('should configure the development server for HMR', () => {
    // Arrange
    const plugin = cucumberWorkers({
      featureGlob: 'custom/**/*.feature'
    });
    
    const server = {
      watcher: {
        add: vi.fn(),
        on: vi.fn()
      }
    };
    
    // Act
    plugin.configureServer(server as any);
    
    // Assert
    expect(server.watcher.add).toHaveBeenCalledWith('custom/**/*.feature');
    expect(server.watcher.on).toHaveBeenCalledWith('change', expect.any(Function));
  });
  
  it('should generate a manifest of feature files', () => {
    // Arrange
    const plugin = cucumberWorkers();
    const featureContent = 'Feature: Test feature';
    const id = 'features/test.feature';
    
    // Mock the emitFile function
    const emitFile = vi.fn();
    const pluginContext = {
      emitFile
    };
    
    // Register a feature file
    plugin.transform(featureContent, id);
    
    // Act
    plugin.generateBundle.call(pluginContext);
    
    // Assert
    expect(emitFile).toHaveBeenCalledWith({
      type: 'asset',
      fileName: 'cucumber-workers-manifest.json',
      source: expect.any(String)
    });
    
    // Verify the manifest content
    const source = emitFile.mock.calls[0][0].source;
    const manifest = JSON.parse(source);
    expect(manifest[id]).toBe(featureContent);
  });
}); 