import { describe, it, expect, beforeEach } from 'vitest';
import { vi } from 'vitest';
import { JsonFormatter } from '../../src/formatters/json-formatter.js';
import { TestStatus, type ScenarioResult, type StepResult } from '../../src/formatters/basic-formatter.js';

describe('JsonFormatter', () => {
  let formatter: JsonFormatter;
  let outputMock: ReturnType<typeof vi.fn>;
  let fileWriterMock: ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    outputMock = vi.fn();
    fileWriterMock = vi.fn();
    formatter = new JsonFormatter(
      { includeSource: false, includeAttachments: true },
      outputMock,
      fileWriterMock
    );
  });
  
  describe('start', () => {
    it('should initialize the formatter', () => {
      formatter.start();
      expect(outputMock).not.toHaveBeenCalled();
    });
  });
  
  describe('addScenario', () => {
    it('should add a scenario to the formatter', () => {
      formatter.start();
      
      const scenario: ScenarioResult = {
        name: 'Test Scenario',
        featurePath: 'features/test.feature',
        line: 10,
        status: TestStatus.PASSED,
        steps: [
          {
            text: 'Given I have a test',
            status: TestStatus.PASSED,
            duration: 100
          },
          {
            text: 'When I run it',
            status: TestStatus.PASSED,
            duration: 50
          },
          {
            text: 'Then it should pass',
            status: TestStatus.PASSED,
            duration: 25
          }
        ]
      };
      
      formatter.addScenario(scenario);
      expect(outputMock).not.toHaveBeenCalled();
    });
    
    it('should handle failed scenarios', () => {
      formatter.start();
      
      const scenario: ScenarioResult = {
        name: 'Failed Scenario',
        featurePath: 'features/test.feature',
        line: 20,
        status: TestStatus.FAILED,
        steps: [
          {
            text: 'Given I have a test',
            status: TestStatus.PASSED,
            duration: 100
          },
          {
            text: 'When I run it',
            status: TestStatus.FAILED,
            duration: 50,
            error: 'Test failed: expected true to be false'
          },
          {
            text: 'Then it should pass',
            status: TestStatus.SKIPPED,
            duration: 0
          }
        ]
      };
      
      formatter.addScenario(scenario);
      expect(outputMock).not.toHaveBeenCalled();
    });
  });
  
  describe('end', () => {
    it('should output JSON for a single scenario', () => {
      formatter.start();
      
      const scenario: ScenarioResult = {
        name: 'Test Scenario',
        featurePath: 'features/test.feature',
        line: 10,
        status: TestStatus.PASSED,
        steps: [
          {
            text: 'Given I have a test',
            status: TestStatus.PASSED,
            duration: 100
          },
          {
            text: 'When I run it',
            status: TestStatus.PASSED,
            duration: 50
          },
          {
            text: 'Then it should pass',
            status: TestStatus.PASSED,
            duration: 25
          }
        ]
      };
      
      formatter.addScenario(scenario);
      formatter.end();
      
      expect(outputMock).toHaveBeenCalledTimes(1);
      
      const output = JSON.parse(outputMock.mock.calls[0][0]);
      expect(output).toBeInstanceOf(Array);
      expect(output).toHaveLength(1);
      
      const feature = output[0];
      expect(feature.uri).toBe('features/test.feature');
      expect(feature.name).toBe('Test');
      expect(feature.elements).toHaveLength(1);
      
      const jsonScenario = feature.elements[0];
      expect(jsonScenario.name).toBe('Test Scenario');
      expect(jsonScenario.line).toBe(10);
      expect(jsonScenario.steps).toHaveLength(3);
      
      const step1 = jsonScenario.steps[0];
      expect(step1.keyword).toBe('Given ');
      expect(step1.name).toBe('Given I have a test');
      expect(step1.result.status).toBe('passed');
      expect(step1.result.duration).toBe(100 * 1000000); // Converted to nanoseconds
    });
    
    it('should output JSON for multiple scenarios in different features', () => {
      formatter.start();
      
      const scenario1: ScenarioResult = {
        name: 'Test Scenario 1',
        featurePath: 'features/test1.feature',
        line: 10,
        status: TestStatus.PASSED,
        steps: [
          {
            text: 'Given I have test 1',
            status: TestStatus.PASSED,
            duration: 100
          }
        ]
      };
      
      const scenario2: ScenarioResult = {
        name: 'Test Scenario 2',
        featurePath: 'features/test2.feature',
        line: 10,
        status: TestStatus.PASSED,
        steps: [
          {
            text: 'Given I have test 2',
            status: TestStatus.PASSED,
            duration: 200
          }
        ]
      };
      
      formatter.addScenario(scenario1);
      formatter.addScenario(scenario2);
      formatter.end();
      
      expect(outputMock).toHaveBeenCalledTimes(1);
      
      const output = JSON.parse(outputMock.mock.calls[0][0]);
      expect(output).toBeInstanceOf(Array);
      expect(output).toHaveLength(2);
      
      const featureNames = output.map((f: any) => f.name);
      expect(featureNames).toContain('Test1');
      expect(featureNames).toContain('Test2');
    });
    
    it('should write to file if outputFile is specified', () => {
      formatter = new JsonFormatter(
        { outputFile: 'cucumber-report.json', includeSource: false, includeAttachments: true },
        outputMock,
        fileWriterMock
      );
      
      formatter.start();
      
      const scenario: ScenarioResult = {
        name: 'Test Scenario',
        featurePath: 'features/test.feature',
        line: 10,
        status: TestStatus.PASSED,
        steps: [
          {
            text: 'Given I have a test',
            status: TestStatus.PASSED,
            duration: 100
          }
        ]
      };
      
      formatter.addScenario(scenario);
      formatter.end();
      
      expect(fileWriterMock).toHaveBeenCalledTimes(1);
      expect(fileWriterMock.mock.calls[0][0]).toBe('cucumber-report.json');
      
      const fileContent = fileWriterMock.mock.calls[0][1];
      expect(JSON.parse(fileContent)).toBeInstanceOf(Array);
    });
  });
  
  describe('convertSteps', () => {
    it('should correctly guess keywords based on step text and position', () => {
      formatter.start();
      
      const steps: StepResult[] = [
        { text: 'Given I have a test', status: TestStatus.PASSED },
        { text: 'And I have another test', status: TestStatus.PASSED },
        { text: 'When I run the tests', status: TestStatus.PASSED },
        { text: 'Then they should pass', status: TestStatus.PASSED },
        { text: 'But they should not fail', status: TestStatus.PASSED }
      ];
      
      const scenario: ScenarioResult = {
        name: 'Test Scenario',
        featurePath: 'features/test.feature',
        line: 10,
        status: TestStatus.PASSED,
        steps
      };
      
      formatter.addScenario(scenario);
      formatter.end();
      
      const output = JSON.parse(outputMock.mock.calls[0][0]);
      const jsonSteps = output[0].elements[0].steps;
      
      expect(jsonSteps[0].keyword).toBe('Given ');
      expect(jsonSteps[1].keyword).toBe('And ');
      expect(jsonSteps[2].keyword).toBe('When ');
      expect(jsonSteps[3].keyword).toBe('Then ');
      expect(jsonSteps[4].keyword).toBe('But ');
    });
    
    it('should include error messages for failed steps', () => {
      formatter.start();
      
      const steps: StepResult[] = [
        { text: 'Given I have a test', status: TestStatus.PASSED },
        { 
          text: 'When I run it', 
          status: TestStatus.FAILED,
          error: 'Expected true to be false'
        },
        { text: 'Then it should pass', status: TestStatus.SKIPPED }
      ];
      
      const scenario: ScenarioResult = {
        name: 'Failed Scenario',
        featurePath: 'features/test.feature',
        line: 10,
        status: TestStatus.FAILED,
        steps
      };
      
      formatter.addScenario(scenario);
      formatter.end();
      
      const output = JSON.parse(outputMock.mock.calls[0][0]);
      const jsonSteps = output[0].elements[0].steps;
      
      expect(jsonSteps[1].result.status).toBe('failed');
      expect(jsonSteps[1].result.error_message).toBe('Expected true to be false');
      expect(jsonSteps[2].result.status).toBe('skipped');
    });
  });
}); 