import { describe, it, expect } from 'vitest';
import { ScenarioOutlineProcessor } from '../../src/core/scenario-outline-processor.js';
import { TagFilter } from '../../src/core/tag-filter.js';
import * as messages from '@cucumber/messages';
import * as gherkin from '@cucumber/gherkin';

describe('ScenarioOutlineProcessor', () => {
  function parseGherkin(gherkinText: string) {
    const newId = messages.IdGenerator.uuid();
    const parser = new gherkin.Parser();
    return parser.parse({
      uri: 'test.feature',
      data: gherkinText,
      newId
    });
  }
  
  describe('processScenarioOutline', () => {
    it.skip('should process a simple scenario outline', () => {
      // Arrange
      const gherkinDocument = parseGherkin(`
        Feature: Test Feature
          Scenario Outline: Test Scenario
            Given a <param> step
            When I do something
            Then I should see <result>
            
            Examples:
              | param  | result |
              | first  | pass   |
              | second | fail   |
      `);
      
      const processor = new ScenarioOutlineProcessor();
      const feature = gherkinDocument.feature!;
      const scenarioOutline = feature.children[0].scenario!;
      
      // Act
      const result = processor.processScenarioOutline(scenarioOutline, feature);
      
      // Assert
      expect(result).toHaveLength(2);
      
      // First scenario
      expect(result[0].name).toBe('Test Scenario');
      expect(result[0].steps).toHaveLength(3);
      expect(result[0].steps[0].text).toBe('a first step');
      expect(result[0].steps[2].text).toBe('I should see pass');
      
      // Second scenario
      expect(result[1].name).toBe('Test Scenario');
      expect(result[1].steps).toHaveLength(3);
      expect(result[1].steps[0].text).toBe('a second step');
      expect(result[1].steps[2].text).toBe('I should see fail');
    });
    
    it.skip('should process a scenario outline with placeholders in data tables', () => {
      // Arrange
      const gherkinDocument = parseGherkin(`
        Feature: Test Feature
          Scenario Outline: Test Scenario with Table
            Given a step with table:
              | id | name   |
              | 1  | <name> |
            
            Examples:
              | name  |
              | Alice |
              | Bob   |
      `);
      
      const processor = new ScenarioOutlineProcessor();
      const feature = gherkinDocument.feature!;
      const scenarioOutline = feature.children[0].scenario!;
      
      // Act
      const result = processor.processScenarioOutline(scenarioOutline, feature);
      
      // Assert
      expect(result).toHaveLength(2);
      
      // First scenario
      expect(result[0].steps[0].dataTable).toBeDefined();
      expect(result[0].steps[0].dataTable!.rows[1].cells[1].value).toBe('Alice');
      
      // Second scenario
      expect(result[1].steps[0].dataTable).toBeDefined();
      expect(result[1].steps[0].dataTable!.rows[1].cells[1].value).toBe('Bob');
    });
    
    it.skip('should process a scenario outline with placeholders in doc strings', () => {
      // Arrange
      const gherkinDocument = parseGherkin(`
        Feature: Test Feature
          Scenario Outline: Test Scenario with DocString
            Given a step with docstring:
              """
              This is a <param> docstring
              """
            
            Examples:
              | param   |
              | first   |
              | second  |
      `);
      
      const processor = new ScenarioOutlineProcessor();
      const feature = gherkinDocument.feature!;
      const scenarioOutline = feature.children[0].scenario!;
      
      // Act
      const result = processor.processScenarioOutline(scenarioOutline, feature);
      
      // Assert
      expect(result).toHaveLength(2);
      
      // First scenario
      expect(result[0].steps[0].docString).toBeDefined();
      expect(result[0].steps[0].docString!.content).toBe('This is a first docstring');
      
      // Second scenario
      expect(result[1].steps[0].docString).toBeDefined();
      expect(result[1].steps[0].docString!.content).toBe('This is a second docstring');
    });
    
    it.skip('should filter examples based on tags', () => {
      // Arrange
      const gherkinDocument = parseGherkin(`
        Feature: Test Feature
          Scenario Outline: Test Scenario
            Given a <param> step
            
            @smoke
            Examples:
              | param  |
              | first  |
              
            @regression
            Examples:
              | param  |
              | second |
      `);
      
      const processor = new ScenarioOutlineProcessor();
      const feature = gherkinDocument.feature!;
      const scenarioOutline = feature.children[0].scenario!;
      const tagFilter = new TagFilter('@smoke');
      
      // Act
      const result = processor.processScenarioOutline(scenarioOutline, feature, undefined, tagFilter);
      
      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].steps[0].text).toBe('a first step');
    });
  });
  
  describe('processDocument', () => {
    it.skip('should process all scenario outlines in a document', () => {
      // Arrange
      const gherkinDocument = parseGherkin(`
        Feature: Test Feature
          Scenario Outline: First Scenario
            Given a <param1> step
            
            Examples:
              | param1 |
              | first  |
              | second |
              
          Scenario Outline: Second Scenario
            Given a <param2> step
            
            Examples:
              | param2 |
              | third  |
              | fourth |
      `);
      
      const processor = new ScenarioOutlineProcessor();
      
      // Act
      const result = processor.processDocument(gherkinDocument);
      
      // Assert
      expect(result).toHaveLength(4);
      expect(result[0].steps[0].text).toBe('a first step');
      expect(result[1].steps[0].text).toBe('a second step');
      expect(result[2].steps[0].text).toBe('a third step');
      expect(result[3].steps[0].text).toBe('a fourth step');
    });
    
    it.skip('should process scenario outlines in rules', () => {
      // Arrange
      const gherkinDocument = parseGherkin(`
        Feature: Test Feature
          Rule: Test Rule
            Scenario Outline: Rule Scenario
              Given a <param> step
              
              Examples:
                | param |
                | rule  |
      `);
      
      const processor = new ScenarioOutlineProcessor();
      
      // Act
      const result = processor.processDocument(gherkinDocument);
      
      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].steps[0].text).toBe('a rule step');
    });
    
    it.skip('should filter scenario outlines based on tags', () => {
      // Arrange
      const gherkinDocument = parseGherkin(`
        Feature: Test Feature
          Scenario Outline: First Scenario
            Given a <param1> step
            
            @smoke
            Examples:
              | param1 |
              | first  |
              
            @regression
            Examples:
              | param1 |
              | second |
              
          Scenario Outline: Second Scenario
            Given a <param2> step
            
            @smoke
            Examples:
              | param2 |
              | third  |
              
            @regression
            Examples:
              | param2 |
              | fourth |
      `);
      
      const processor = new ScenarioOutlineProcessor();
      const tagFilter = new TagFilter('@smoke');
      
      // Act
      const result = processor.processDocument(gherkinDocument, tagFilter);
      
      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].steps[0].text).toBe('a first step');
      expect(result[1].steps[0].text).toBe('a third step');
    });
  });
}); 