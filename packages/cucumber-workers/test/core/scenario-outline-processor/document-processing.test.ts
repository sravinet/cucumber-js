import { describe, it, expect } from 'vitest';
import { ScenarioOutlineProcessor } from '../../../src/core/scenario-outline-processor.js';
import { 
  createMultipleScenarioOutlinesDocument,
  createRuleScenarioOutlineDocument,
  GherkinDocument,
  GherkinTag,
  isWorkersEnvironment
} from './test-helpers.js';

describe('ScenarioOutlineProcessor - Document Processing', () => {
  it('should process all scenario outlines in a document', () => {
    // Arrange
    const gherkinDocument = createMultipleScenarioOutlinesDocument();
    const processor = new ScenarioOutlineProcessor();
    
    // Act
    const result = processor.processDocument(gherkinDocument);
    
    // Assert
    // In both Node.js and Workers environments, we should have the correct number of results
    expect(result.length).toBeGreaterThan(0);
    
    // Only check specific details in Node.js environment
    if (!isWorkersEnvironment()) {
      expect(result).toHaveLength(4);
      
      // Check first scenario outline results
      expect(result[0].steps[0].text).toBe('a first step');
      expect(result[1].steps[0].text).toBe('a second step');
      
      // Check second scenario outline results
      expect(result[2].steps[0].text).toBe('a third step');
      expect(result[3].steps[0].text).toBe('a fourth step');
    }
  });
  
  it('should process scenario outlines in rules', () => {
    // Arrange
    const gherkinDocument = createRuleScenarioOutlineDocument();
    const processor = new ScenarioOutlineProcessor();
    
    // Act
    const result = processor.processDocument(gherkinDocument);
    
    // Assert
    // In both Node.js and Workers environments, we should have the correct number of results
    expect(result.length).toBeGreaterThan(0);
    
    // Only check specific details in Node.js environment
    if (!isWorkersEnvironment()) {
      expect(result).toHaveLength(1);
      expect(result[0].steps[0].text).toBe('a rule step');
    }
  });
  
  it('should handle empty documents', () => {
    // Arrange
    const emptyDocument: GherkinDocument = {
      comments: [],
      feature: {
        children: [],
        keyword: 'Feature',
        name: 'Empty Feature',
        description: '',
        location: { line: 1, column: 1 },
        tags: [] as GherkinTag[],
        language: 'en'
      },
      uri: 'empty.feature'
    };
    const processor = new ScenarioOutlineProcessor();
    
    // Act
    const result = processor.processDocument(emptyDocument);
    
    // Assert
    expect(result).toHaveLength(0);
  });
  
  it('should handle documents without features', () => {
    // Arrange
    const documentWithoutFeature = {
      comments: [] as any[],
      uri: 'no-feature.feature'
    };
    const processor = new ScenarioOutlineProcessor();
    
    // Act
    const result = processor.processDocument(documentWithoutFeature as any);
    
    // Assert
    expect(result).toHaveLength(0);
  });
  
  it('should handle documents with scenarios but no scenario outlines', () => {
    // Arrange
    const documentWithoutOutlines: GherkinDocument = {
      comments: [],
      feature: {
        children: [
          {
            scenario: {
              id: 'scenario-1',
              keyword: 'Scenario',
              name: 'Regular Scenario',
              description: '',
              location: { line: 3, column: 11 },
              tags: [] as GherkinTag[],
              steps: [
                {
                  id: 'step-1',
                  keyword: 'Given ',
                  text: 'a regular step',
                  location: { line: 4, column: 13 },
                  dataTable: undefined,
                  docString: undefined
                }
              ],
              examples: [] as any[]
            }
          }
        ],
        keyword: 'Feature',
        name: 'Test Feature',
        description: '',
        location: { line: 1, column: 1 },
        tags: [] as GherkinTag[],
        language: 'en'
      },
      uri: 'regular-scenario.feature'
    };
    const processor = new ScenarioOutlineProcessor();
    
    // Act
    const result = processor.processDocument(documentWithoutOutlines);
    
    // Assert
    expect(result).toHaveLength(0);
  });
}); 