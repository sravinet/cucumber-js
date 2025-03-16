/**
 * Tests for the JSON formatter in a Workers-like environment
 * 
 * These tests verify that the JSON formatter works correctly in a V8 environment
 * without Node.js dependencies, similar to the Cloudflare Workers runtime.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JsonFormatter } from '../../src/formatters/json-formatter.js';
import { TestStatus, type ScenarioResult } from '../../src/formatters/basic-formatter.js';

describe('JsonFormatter in Workers environment', () => {
  let formatter: JsonFormatter;
  let outputData: string;
  let fileData: Record<string, string>;
  
  // Custom output function that doesn't rely on Node.js
  const workerOutput = (message: string): void => {
    outputData = message;
  };
  
  // Custom file writer function that doesn't rely on Node.js
  // In a real Workers environment, this might use KV storage or similar
  const workerFileWriter = (path: string, content: string): void => {
    fileData[path] = content;
  };
  
  beforeEach(() => {
    outputData = '';
    fileData = {};
    formatter = new JsonFormatter(
      { 
        outputFile: 'cucumber-report.json',
        includeSource: false,
        includeAttachments: true
      },
      workerOutput,
      workerFileWriter
    );
  });
  
  it('should work without Node.js dependencies', () => {
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
    
    // Verify output was captured
    expect(outputData).not.toBe('');
    
    // Verify file was written
    expect(fileData['cucumber-report.json']).toBeDefined();
    
    // Parse and verify the JSON structure
    const output = JSON.parse(outputData);
    expect(output).toBeInstanceOf(Array);
    expect(output).toHaveLength(1);
    
    const feature = output[0];
    expect(feature.uri).toBe('features/test.feature');
    expect(feature.elements).toHaveLength(1);
    
    const jsonScenario = feature.elements[0];
    expect(jsonScenario.name).toBe('Test Scenario');
    expect(jsonScenario.steps).toHaveLength(3);
  });
  
  it('should handle multiple scenarios without Node.js dependencies', () => {
    formatter.start();
    
    // Add first scenario
    formatter.addScenario({
      name: 'First Scenario',
      featurePath: 'features/test.feature',
      line: 10,
      status: TestStatus.PASSED,
      steps: [
        {
          text: 'Given I have the first test',
          status: TestStatus.PASSED,
          duration: 100
        }
      ]
    });
    
    // Add second scenario
    formatter.addScenario({
      name: 'Second Scenario',
      featurePath: 'features/test.feature',
      line: 20,
      status: TestStatus.FAILED,
      steps: [
        {
          text: 'Given I have the second test',
          status: TestStatus.PASSED,
          duration: 100
        },
        {
          text: 'When it fails',
          status: TestStatus.FAILED,
          duration: 50,
          error: 'Test failure'
        }
      ]
    });
    
    formatter.end();
    
    // Parse and verify the JSON structure
    const output = JSON.parse(outputData);
    expect(output).toBeInstanceOf(Array);
    expect(output).toHaveLength(1);
    
    const feature = output[0];
    expect(feature.elements).toHaveLength(2);
    
    // Verify first scenario
    const firstScenario = feature.elements[0];
    expect(firstScenario.name).toBe('First Scenario');
    expect(firstScenario.steps).toHaveLength(1);
    
    // Verify second scenario
    const secondScenario = feature.elements[1];
    expect(secondScenario.name).toBe('Second Scenario');
    expect(secondScenario.steps).toHaveLength(2);
    expect(secondScenario.steps[1].result.status).toBe('failed');
    expect(secondScenario.steps[1].result.error_message).toBe('Test failure');
  });
  
  it('should work with large datasets without Node.js dependencies', () => {
    formatter.start();
    
    // Add 100 scenarios to test performance and memory usage
    for (let i = 0; i < 100; i++) {
      formatter.addScenario({
        name: `Scenario ${i}`,
        featurePath: 'features/test.feature',
        line: 10 + i,
        status: i % 10 === 0 ? TestStatus.FAILED : TestStatus.PASSED,
        steps: [
          {
            text: `Given I have test ${i}`,
            status: TestStatus.PASSED,
            duration: 10
          },
          {
            text: `When I run test ${i}`,
            status: i % 10 === 0 ? TestStatus.FAILED : TestStatus.PASSED,
            duration: 5,
            error: i % 10 === 0 ? `Test ${i} failed` : undefined
          }
        ]
      });
    }
    
    formatter.end();
    
    // Parse and verify the JSON structure
    const output = JSON.parse(outputData);
    expect(output).toBeInstanceOf(Array);
    
    const feature = output[0];
    expect(feature.elements).toHaveLength(100);
    
    // Verify some scenarios
    expect(feature.elements[0].name).toBe('Scenario 0');
    expect(feature.elements[99].name).toBe('Scenario 99');
    
    // Verify failed scenarios
    const failedScenarios = feature.elements.filter(
      (s: any) => s.steps.some((step: any) => step.result.status === 'failed')
    );
    expect(failedScenarios.length).toBe(10);
  });
}); 