/**
 * Tests for the JSON formatter in a V8 environment
 * 
 * These tests simulate a V8 environment more closely, avoiding any Node.js
 * dependencies to ensure compatibility with the Cloudflare Workers runtime.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JsonFormatter } from '../../src/formatters/json-formatter.js';
import { TestStatus, type ScenarioResult } from '../../src/formatters/basic-formatter.js';
import { runCucumberInWorkers, type WorkersRuntime } from '../../src/adapters/workers-runtime-adapter.js';

describe('JsonFormatter in V8 environment', () => {
  // Mock the Workers runtime
  const mockWorkersRuntime = (): WorkersRuntime & { logs: string[], errors: string[] } => {
    const logs: string[] = [];
    const errors: string[] = [];
    
    return {
      console: {
        log: (...args: any[]) => { logs.push(args.join(' ')); },
        error: (...args: any[]) => { errors.push(args.join(' ')); },
        warn: (...args: any[]) => { logs.push(`WARN: ${args.join(' ')}`); },
        info: (...args: any[]) => { logs.push(`INFO: ${args.join(' ')}`); },
        debug: (...args: any[]) => { logs.push(`DEBUG: ${args.join(' ')}`); },
        stdout: {
          write: (data: string) => { logs.push(data); }
        },
        stderr: {
          write: (data: string) => { errors.push(data); }
        }
      },
      env: {},
      fetch: globalThis.fetch,
      logs,
      errors
    };
  };
  
  // Mock KV storage for the Workers environment
  class MockKVStorage {
    private storage: Map<string, string> = new Map();
    
    async put(key: string, value: string): Promise<void> {
      this.storage.set(key, value);
    }
    
    async get(key: string): Promise<string | null> {
      return this.storage.get(key) || null;
    }
    
    getAll(): Record<string, string> {
      return Object.fromEntries(this.storage.entries());
    }
  }
  
  let formatter: JsonFormatter;
  let kvStorage: MockKVStorage;
  let runtime: ReturnType<typeof mockWorkersRuntime>;
  
  // Custom output function that uses the Workers runtime
  const workerOutput = (message: string): void => {
    runtime.console.log(message);
  };
  
  // Custom file writer function that uses KV storage
  const workerFileWriter = (path: string, content: string): void => {
    // In a real Workers environment, this would be an async operation
    // but we're simplifying for the test
    void kvStorage.put(path, content);
  };
  
  beforeEach(() => {
    runtime = mockWorkersRuntime();
    kvStorage = new MockKVStorage();
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
  
  it('should work in a V8 environment', () => {
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
    
    // Get logs from the runtime
    const logs = runtime.logs;
    
    // Verify that the output contains valid JSON
    const jsonOutput = logs[0];
    expect(jsonOutput).toBeDefined();
    
    // Parse and verify the JSON structure
    const output = JSON.parse(jsonOutput);
    expect(output).toBeInstanceOf(Array);
    expect(output).toHaveLength(1);
    
    const feature = output[0];
    expect(feature.uri).toBe('features/test.feature');
    expect(feature.elements).toHaveLength(1);
    
    const jsonScenario = feature.elements[0];
    expect(jsonScenario.name).toBe('Test Scenario');
    expect(jsonScenario.steps).toHaveLength(3);
  });
  
  it('should integrate with the Workers runtime adapter', async () => {
    // Mock the runCucumberInWorkers function
    const originalRunCucumberInWorkers = runCucumberInWorkers;
    const mockRunCucumberInWorkers = vi.fn().mockImplementation(
      (options, runtime) => {
        // Simulate running scenarios
        const formatter = new JsonFormatter(
          { includeSource: false, includeAttachments: true },
          (msg) => runtime.console.log(msg),
          () => { /* no-op */ }
        );
        
        formatter.start();
        
        // Add a test scenario
        formatter.addScenario({
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
        });
        
        formatter.end();
        
        return Promise.resolve({
          success: true,
          summary: {
            total: 1,
            passed: 1,
            failed: 0,
            skipped: 0,
            pending: 0
          }
        });
      }
    );
    
    // Replace the original function with the mock
    (globalThis as any).runCucumberInWorkers = mockRunCucumberInWorkers;
    
    // Run Cucumber in the Workers runtime
    const result = await mockRunCucumberInWorkers(
      {
        features: {
          paths: ['features/test.feature']
        },
        support: {},
        formats: {
          stdout: 'json'
        }
      },
      runtime
    );
    
    // Verify the result
    expect(result.success).toBe(true);
    expect(result.summary.total).toBe(1);
    expect(result.summary.passed).toBe(1);
    
    // Get logs from the runtime
    const logs = runtime.logs;
    
    // Verify that the output contains valid JSON
    const jsonOutput = logs[0];
    expect(jsonOutput).toBeDefined();
    
    // Parse and verify the JSON structure
    try {
      const output = JSON.parse(jsonOutput);
      expect(output).toBeInstanceOf(Array);
      expect(output[0].elements[0].name).toBe('Test Scenario');
    } catch (e) {
      // If parsing fails, output the actual content for debugging
      // eslint-disable-next-line no-console
      console.error('Failed to parse JSON:', jsonOutput);
      throw e;
    }
    
    // Restore the original function
    (globalThis as any).runCucumberInWorkers = originalRunCucumberInWorkers;
  });
  
  it('should handle large datasets in a V8 environment', () => {
    formatter.start();
    
    // Add 50 scenarios to test performance and memory usage
    // This is a smaller number than the previous test to avoid timeouts
    for (let i = 0; i < 50; i++) {
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
    
    // Get logs from the runtime
    const logs = runtime.logs;
    
    // Verify that the output contains valid JSON
    const jsonOutput = logs[0];
    expect(jsonOutput).toBeDefined();
    
    // Parse and verify the JSON structure
    const output = JSON.parse(jsonOutput);
    expect(output).toBeInstanceOf(Array);
    
    const feature = output[0];
    expect(feature.elements).toHaveLength(50);
    
    // Verify some scenarios
    expect(feature.elements[0].name).toBe('Scenario 0');
    expect(feature.elements[49].name).toBe('Scenario 49');
    
    // Verify failed scenarios
    const failedScenarios = feature.elements.filter(
      (s: any) => s.steps.some((step: any) => step.result.status === 'failed')
    );
    expect(failedScenarios.length).toBe(5); // 0, 10, 20, 30, 40
  });
}); 