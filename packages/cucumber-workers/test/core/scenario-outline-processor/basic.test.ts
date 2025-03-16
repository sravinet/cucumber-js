import { describe, it, expect } from 'vitest';
import { ScenarioOutlineProcessor } from '../../../src/core/scenario-outline-processor.js';
import { 
  createBasicScenarioOutlineDocument,
  GherkinScenario
} from './test-helpers.js';

describe('ScenarioOutlineProcessor - Basic', () => {
  it('should process a simple scenario outline', () => {
    // Arrange
    const gherkinDocument = createBasicScenarioOutlineDocument();
    const processor = new ScenarioOutlineProcessor();
    const feature = gherkinDocument.feature;
    const scenarioOutline = (feature.children[0] as { scenario: GherkinScenario }).scenario;
    
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
  
  it('should preserve step keywords when processing scenario outlines', () => {
    // Arrange
    const gherkinDocument = createBasicScenarioOutlineDocument();
    const processor = new ScenarioOutlineProcessor();
    const feature = gherkinDocument.feature;
    const scenarioOutline = (feature.children[0] as { scenario: GherkinScenario }).scenario;
    
    // Act
    const result = processor.processScenarioOutline(scenarioOutline, feature);
    
    // Assert
    expect(result).toHaveLength(2);
    
    // Check keywords are preserved
    expect(result[0].steps[0].keyword).toBe('Given ');
    expect(result[0].steps[1].keyword).toBe('When ');
    expect(result[0].steps[2].keyword).toBe('Then ');
    
    expect(result[1].steps[0].keyword).toBe('Given ');
    expect(result[1].steps[1].keyword).toBe('When ');
    expect(result[1].steps[2].keyword).toBe('Then ');
  });
  
  it('should include original scenario and examples information', () => {
    // Arrange
    const gherkinDocument = createBasicScenarioOutlineDocument();
    const processor = new ScenarioOutlineProcessor();
    const feature = gherkinDocument.feature;
    const scenarioOutline = (feature.children[0] as { scenario: GherkinScenario }).scenario;
    
    // Act
    const result = processor.processScenarioOutline(scenarioOutline, feature);
    
    // Assert
    expect(result).toHaveLength(2);
    
    // Check original scenario reference
    expect(result[0].originalScenario).toBe(scenarioOutline);
    expect(result[1].originalScenario).toBe(scenarioOutline);
    
    // Check examples information
    expect(result[0].examplesHeader).toEqual(['param', 'result']);
    expect(result[0].examplesRow).toEqual(['first', 'pass']);
    
    expect(result[1].examplesHeader).toEqual(['param', 'result']);
    expect(result[1].examplesRow).toEqual(['second', 'fail']);
  });
  
  it('should include line numbers from examples rows', () => {
    // Arrange
    const gherkinDocument = createBasicScenarioOutlineDocument();
    const processor = new ScenarioOutlineProcessor();
    const feature = gherkinDocument.feature;
    const scenarioOutline = (feature.children[0] as { scenario: GherkinScenario }).scenario;
    
    // Act
    const result = processor.processScenarioOutline(scenarioOutline, feature);
    
    // Assert
    expect(result).toHaveLength(2);
    
    // Check line numbers
    expect(result[0].line).toBe(10);
    expect(result[1].line).toBe(11);
  });
}); 