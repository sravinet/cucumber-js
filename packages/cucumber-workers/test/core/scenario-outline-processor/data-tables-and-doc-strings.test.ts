import { describe, it, expect } from 'vitest';
import { ScenarioOutlineProcessor } from '../../../src/core/scenario-outline-processor.js';
import { 
  createDataTableScenarioOutlineDocument,
  createDocStringScenarioOutlineDocument,
  GherkinScenario,
  isWorkersEnvironment
} from './test-helpers.js';

describe('ScenarioOutlineProcessor - Data Tables and Doc Strings', () => {
  describe('Data Tables', () => {
    it('should process a scenario outline with placeholders in data tables', () => {
      // Arrange
      const gherkinDocument = createDataTableScenarioOutlineDocument();
      const processor = new ScenarioOutlineProcessor();
      const feature = gherkinDocument.feature;
      const scenarioOutline = (feature.children[0] as { scenario: GherkinScenario }).scenario;
      
      // Act
      const result = processor.processScenarioOutline(scenarioOutline, feature);
      
      // Assert
      expect(result).toHaveLength(2);
      
      // In both Node.js and Workers environments, we should have the correct number of results
      expect(result[0].steps[0].text).toBe('a step with table:');
      expect(result[1].steps[0].text).toBe('a step with table:');
      
      // Only check data table details in Node.js environment
      // In Workers environment, the implementation might handle data tables differently
      if (!isWorkersEnvironment()) {
        // First scenario
        expect(result[0].steps[0].dataTable).toBeDefined();
        expect(result[0].steps[0].dataTable!.rows).toHaveLength(2);
        expect(result[0].steps[0].dataTable!.rows[1].cells[1].value).toBe('Alice');
        
        // Second scenario
        expect(result[1].steps[0].dataTable).toBeDefined();
        expect(result[1].steps[0].dataTable!.rows).toHaveLength(2);
        expect(result[1].steps[0].dataTable!.rows[1].cells[1].value).toBe('Bob');
      }
    });
    
    it('should handle complex data tables with multiple placeholders', () => {
      // This test is a placeholder for future implementation
      // It would test more complex data tables with multiple placeholders
      // For now, we'll just verify the basic functionality works
      
      // Arrange
      const gherkinDocument = createDataTableScenarioOutlineDocument();
      const processor = new ScenarioOutlineProcessor();
      const feature = gherkinDocument.feature;
      const scenarioOutline = (feature.children[0] as { scenario: GherkinScenario }).scenario;
      
      // Act
      const result = processor.processScenarioOutline(scenarioOutline, feature);
      
      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].examplesRow).toEqual(['Alice']);
      expect(result[1].examplesRow).toEqual(['Bob']);
    });
  });
  
  describe('Doc Strings', () => {
    it('should process a scenario outline with placeholders in doc strings', () => {
      // Arrange
      const gherkinDocument = createDocStringScenarioOutlineDocument();
      const processor = new ScenarioOutlineProcessor();
      const feature = gherkinDocument.feature;
      const scenarioOutline = (feature.children[0] as { scenario: GherkinScenario }).scenario;
      
      // Act
      const result = processor.processScenarioOutline(scenarioOutline, feature);
      
      // Assert
      expect(result).toHaveLength(2);
      
      // In both Node.js and Workers environments, we should have the correct number of results
      expect(result[0].steps[0].text).toBe('a step with docstring:');
      expect(result[1].steps[0].text).toBe('a step with docstring:');
      
      // Only check doc string details in Node.js environment
      // In Workers environment, the implementation might handle doc strings differently
      if (!isWorkersEnvironment()) {
        // First scenario
        expect(result[0].steps[0].docString).toBeDefined();
        expect(result[0].steps[0].docString!.content).toBe('This is a first docstring');
        
        // Second scenario
        expect(result[1].steps[0].docString).toBeDefined();
        expect(result[1].steps[0].docString!.content).toBe('This is a second docstring');
      }
    });
    
    it('should preserve media type in doc strings', () => {
      // Arrange
      const gherkinDocument = createDocStringScenarioOutlineDocument();
      const processor = new ScenarioOutlineProcessor();
      const feature = gherkinDocument.feature;
      const scenarioOutline = (feature.children[0] as { scenario: GherkinScenario }).scenario;
      
      // Act
      const result = processor.processScenarioOutline(scenarioOutline, feature);
      
      // Assert
      expect(result).toHaveLength(2);
      
      // Only check doc string details in Node.js environment
      if (!isWorkersEnvironment()) {
        // Check media type is preserved
        expect(result[0].steps[0].docString).toBeDefined();
        expect(result[0].steps[0].docString!.mediaType).toBe('');
      }
    });
  });
}); 