import { Miniflare } from 'miniflare';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JsonFormatter } from '../../src/formatters/json-formatter.js';
import { TestStatus } from '../../src/formatters/basic-formatter.js';

describe('JsonFormatter in Cloudflare Workers environment', () => {
  let miniflare: Miniflare;
  let kvNamespace: any;

  // Set up Miniflare before each test
  beforeEach(async () => {
    // Create a new Miniflare instance for each test
    miniflare = new Miniflare({
      modules: true,
      script: `
        export default {
          async fetch(request, env) {
            return new Response("Miniflare is running");
          }
        }
      `,
      kvNamespaces: ['CUCUMBER_RESULTS'],
      // Simulate Cloudflare Workers environment
      compatibilityDate: '2023-12-01',
    });

    // Get the KV namespace
    kvNamespace = await miniflare.getKVNamespace('CUCUMBER_RESULTS');
  });

  // Clean up after each test
  afterEach(async () => {
    // Clean up any KV entries
    const keys = await kvNamespace.list();
    for (const key of keys.keys) {
      await kvNamespace.delete(key.name);
    }
  });

  it('should generate and store JSON reports in KV storage', async () => {
    // Create a file writer function that uses KV storage
    const workerFileWriter = async (path: string, content: string): Promise<void> => {
      await kvNamespace.put(path, content);
    };

    // Create a JSON formatter with KV storage
    const formatter = new JsonFormatter(
      { 
        outputFile: 'test-report.json',
        includeSource: true,
        includeAttachments: true
      },
      () => {}, // No console output
      workerFileWriter
    );

    // Start the formatter
    formatter.start();

    // Add a test scenario
    formatter.addScenario({
      name: 'Test in Workers',
      featurePath: 'features/workers.feature',
      line: 10,
      status: TestStatus.PASSED,
      steps: [
        {
          text: 'Given I am running in Workers',
          status: TestStatus.PASSED,
          duration: 5
        },
        {
          text: 'When I execute the test',
          status: TestStatus.PASSED,
          duration: 10
        },
        {
          text: 'Then it should pass',
          status: TestStatus.PASSED,
          duration: 5
        }
      ]
    });

    // End the formatter to generate the report
    formatter.end();

    // Verify the report was stored in KV
    const report = await kvNamespace.get('test-report.json');
    expect(report).toBeDefined();
    
    // Parse the report and verify its contents
    const parsedReport = JSON.parse(report);
    expect(Array.isArray(parsedReport)).toBe(true);
    expect(parsedReport.length).toBe(1);
    
    // Verify the feature details
    const feature = parsedReport[0];
    expect(feature.uri).toBe('features/workers.feature');
    expect(feature.elements.length).toBe(1);
    
    // Verify the scenario details
    const scenario = feature.elements[0];
    expect(scenario.name).toBe('Test in Workers');
    expect(scenario.line).toBe(10);
    expect(scenario.steps.length).toBe(3);
    
    // Verify the steps
    const steps = scenario.steps;
    expect(steps[0].name).toBe('Given I am running in Workers');
    expect(steps[0].result.status).toBe('passed');
    expect(steps[1].name).toBe('When I execute the test');
    expect(steps[1].result.status).toBe('passed');
    expect(steps[2].name).toBe('Then it should pass');
    expect(steps[2].result.status).toBe('passed');
  });

  it('should handle multiple scenarios and features', async () => {
    // Create a file writer function that uses KV storage
    const workerFileWriter = async (path: string, content: string): Promise<void> => {
      await kvNamespace.put(path, content);
    };

    // Create a JSON formatter with KV storage
    const formatter = new JsonFormatter(
      { 
        outputFile: 'multi-report.json',
        includeSource: false,
        includeAttachments: true
      },
      () => {}, // No console output
      workerFileWriter
    );

    // Start the formatter
    formatter.start();

    // Add scenarios from different features
    formatter.addScenario({
      name: 'Adding two numbers',
      featurePath: 'features/calculator.feature',
      line: 10,
      status: TestStatus.PASSED,
      steps: [
        {
          text: 'Given I have entered 50 into the calculator',
          status: TestStatus.PASSED,
          duration: 5
        },
        {
          text: 'And I have entered 70 into the calculator',
          status: TestStatus.PASSED,
          duration: 3
        },
        {
          text: 'When I press add',
          status: TestStatus.PASSED,
          duration: 10
        },
        {
          text: 'Then the result should be 120 on the screen',
          status: TestStatus.PASSED,
          duration: 7
        }
      ]
    });

    formatter.addScenario({
      name: 'Subtracting two numbers',
      featurePath: 'features/calculator.feature',
      line: 20,
      status: TestStatus.FAILED,
      steps: [
        {
          text: 'Given I have entered 50 into the calculator',
          status: TestStatus.PASSED,
          duration: 4
        },
        {
          text: 'And I have entered 30 into the calculator',
          status: TestStatus.PASSED,
          duration: 3
        },
        {
          text: 'When I press subtract',
          status: TestStatus.PASSED,
          duration: 8
        },
        {
          text: 'Then the result should be 20 on the screen',
          status: TestStatus.FAILED,
          duration: 6,
          error: 'Expected 20 but got 10'
        }
      ]
    });

    formatter.addScenario({
      name: 'User login',
      featurePath: 'features/authentication.feature',
      line: 5,
      status: TestStatus.PASSED,
      steps: [
        {
          text: 'Given I am on the login page',
          status: TestStatus.PASSED,
          duration: 15
        },
        {
          text: 'When I enter valid credentials',
          status: TestStatus.PASSED,
          duration: 20
        },
        {
          text: 'Then I should be logged in',
          status: TestStatus.PASSED,
          duration: 25
        }
      ]
    });

    // End the formatter to generate the report
    formatter.end();

    // Verify the report was stored in KV
    const report = await kvNamespace.get('multi-report.json');
    expect(report).toBeDefined();
    
    // Parse the report and verify its contents
    const parsedReport = JSON.parse(report);
    expect(Array.isArray(parsedReport)).toBe(true);
    expect(parsedReport.length).toBe(2); // Two features
    
    // Find features by URI
    const calculatorFeature = parsedReport.find((f: any) => f.uri === 'features/calculator.feature');
    const authFeature = parsedReport.find((f: any) => f.uri === 'features/authentication.feature');
    
    expect(calculatorFeature).toBeDefined();
    expect(authFeature).toBeDefined();
    
    // Verify calculator feature has two scenarios
    expect(calculatorFeature.elements.length).toBe(2);
    
    // Verify authentication feature has one scenario
    expect(authFeature.elements.length).toBe(1);
    
    // Verify the failed scenario
    const failedScenario = calculatorFeature.elements.find((s: any) => s.name === 'Subtracting two numbers');
    expect(failedScenario).toBeDefined();
    
    // Verify the failed step
    const failedStep = failedScenario.steps.find((s: any) => s.name.includes('result should be 20'));
    expect(failedStep).toBeDefined();
    expect(failedStep.result.status).toBe('failed');
    expect(failedStep.result.error_message).toBe('Expected 20 but got 10');
  });

  it('should handle large reports without exceeding KV limits', async () => {
    // Create a file writer function that uses KV storage
    const workerFileWriter = async (path: string, content: string): Promise<void> => {
      await kvNamespace.put(path, content);
    };

    // Create a JSON formatter with KV storage
    const formatter = new JsonFormatter(
      { 
        outputFile: 'large-report.json',
        includeSource: false,
        includeAttachments: false // Disable attachments to reduce size
      },
      () => {}, // No console output
      workerFileWriter
    );

    // Start the formatter
    formatter.start();

    // Add many scenarios to test handling large reports
    for (let i = 0; i < 50; i++) {
      formatter.addScenario({
        name: `Scenario ${i + 1}`,
        featurePath: 'features/large-test.feature',
        line: 10 + i * 10,
        status: i % 5 === 0 ? TestStatus.FAILED : TestStatus.PASSED,
        steps: [
          {
            text: `Given I have step ${i + 1}`,
            status: TestStatus.PASSED,
            duration: 5
          },
          {
            text: `When I execute step ${i + 1}`,
            status: i % 5 === 0 ? TestStatus.FAILED : TestStatus.PASSED,
            duration: 10,
            error: i % 5 === 0 ? `Step ${i + 1} failed` : undefined
          },
          {
            text: `Then I should see result ${i + 1}`,
            status: i % 5 === 0 ? TestStatus.SKIPPED : TestStatus.PASSED,
            duration: i % 5 === 0 ? undefined : 5
          }
        ]
      });
    }

    // End the formatter to generate the report
    formatter.end();

    // Verify the report was stored in KV
    const report = await kvNamespace.get('large-report.json');
    expect(report).toBeDefined();
    
    // Parse the report and verify its contents
    const parsedReport = JSON.parse(report);
    expect(Array.isArray(parsedReport)).toBe(true);
    expect(parsedReport.length).toBe(1);
    
    // Verify the feature has 50 scenarios
    const feature = parsedReport[0];
    expect(feature.elements.length).toBe(50);
    
    // Verify the number of failed scenarios (every 5th scenario)
    const failedScenarios = feature.elements.filter((s: any) => {
      return s.steps.some((step: any) => step.result.status === 'failed');
    });
    expect(failedScenarios.length).toBe(10); // 50 / 5 = 10 failed scenarios
    
    // Verify the report size is within KV limits (25MB)
    expect(report.length).toBeLessThan(25 * 1024 * 1024);
  });
}); 