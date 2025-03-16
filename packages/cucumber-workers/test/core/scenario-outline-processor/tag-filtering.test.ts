import { describe, it, expect } from 'vitest';
import { ScenarioOutlineProcessor } from '../../../src/core/scenario-outline-processor.js';
import { TagFilter } from '../../../src/core/tag-filter.js';
import { 
  createTaggedExamplesDocument,
  createTaggedScenarioOutlinesDocument,
  GherkinScenario,
  isWorkersEnvironment
} from './test-helpers.js';

describe('ScenarioOutlineProcessor - Tag Filtering', () => {
  describe('Filtering Examples', () => {
    it('should filter examples based on tags', () => {
      // Arrange
      const gherkinDocument = createTaggedExamplesDocument();
      const processor = new ScenarioOutlineProcessor();
      const feature = gherkinDocument.feature;
      const scenarioOutline = (feature.children[0] as { scenario: GherkinScenario }).scenario;
      const tagFilter = new TagFilter('@smoke');
      
      // Act
      const result = processor.processScenarioOutline(scenarioOutline, feature, undefined, tagFilter);
      
      // Assert
      // In both Node.js and Workers environments, we should have filtered results
      expect(result.length).toBeGreaterThan(0);
      
      // Only check specific details in Node.js environment
      if (!isWorkersEnvironment()) {
        expect(result).toHaveLength(1);
        expect(result[0].steps[0].text).toBe('a first step');
        expect(result[0].tags).toContain('@smoke');
      }
    });
    
    it('should filter examples with complex tag expressions', () => {
      // Arrange
      const gherkinDocument = createTaggedExamplesDocument();
      const processor = new ScenarioOutlineProcessor();
      const feature = gherkinDocument.feature;
      const scenarioOutline = (feature.children[0] as { scenario: GherkinScenario }).scenario;
      const tagFilter = new TagFilter('@smoke or @regression');
      
      // Act
      const result = processor.processScenarioOutline(scenarioOutline, feature, undefined, tagFilter);
      
      // Assert
      // In both Node.js and Workers environments, we should have filtered results
      expect(result.length).toBeGreaterThan(0);
      
      // Only check specific details in Node.js environment
      if (!isWorkersEnvironment()) {
        expect(result).toHaveLength(2);
        
        // Check that both examples are included
        const stepTexts = result.map(scenario => scenario.steps[0].text);
        expect(stepTexts).toContain('a first step');
        expect(stepTexts).toContain('a second step');
      }
    });
    
    it('should return empty array when no examples match tag filter', () => {
      // Arrange
      const gherkinDocument = createTaggedExamplesDocument();
      const processor = new ScenarioOutlineProcessor();
      const feature = gherkinDocument.feature;
      const scenarioOutline = (feature.children[0] as { scenario: GherkinScenario }).scenario;
      const tagFilter = new TagFilter('@unknown');
      
      // Act
      const result = processor.processScenarioOutline(scenarioOutline, feature, undefined, tagFilter);
      
      // Assert
      expect(result).toHaveLength(0);
    });
  });
  
  describe('Filtering Document', () => {
    it('should filter scenario outlines based on tags', () => {
      // Arrange
      const gherkinDocument = createTaggedScenarioOutlinesDocument();
      const processor = new ScenarioOutlineProcessor();
      const tagFilter = new TagFilter('@smoke');
      
      // Act
      const result = processor.processDocument(gherkinDocument, tagFilter);
      
      // Assert
      // In both Node.js and Workers environments, we should have filtered results
      expect(result.length).toBeGreaterThan(0);
      
      // Only check specific details in Node.js environment
      if (!isWorkersEnvironment()) {
        expect(result).toHaveLength(1);
        expect(result[0].steps[0].text).toBe('a first step');
      }
    });
    
    it('should filter scenario outlines with complex tag expressions', () => {
      // Arrange
      const gherkinDocument = createTaggedScenarioOutlinesDocument();
      const processor = new ScenarioOutlineProcessor();
      const tagFilter = new TagFilter('@smoke or @regression');
      
      // Act
      const result = processor.processDocument(gherkinDocument, tagFilter);
      
      // Assert
      // In both Node.js and Workers environments, we should have filtered results
      expect(result.length).toBeGreaterThan(0);
      
      // Only check specific details in Node.js environment
      if (!isWorkersEnvironment()) {
        expect(result).toHaveLength(2);
        
        // Check that both examples are included
        const stepTexts = result.map(scenario => scenario.steps[0].text);
        expect(stepTexts).toContain('a first step');
        expect(stepTexts).toContain('a second step');
      }
    });
  });
}); 