/**
 * Example demonstrating the JSON formatter in a Cloudflare Workers environment
 * 
 * This example shows how to use the JSON formatter in a Workers environment
 * without relying on Node.js APIs.
 */

import { JsonFormatter } from '../../src/formatters/json-formatter.js';
import { TestStatus } from '../../src/formatters/basic-formatter.js';

/**
 * Example of a KV namespace for storing test results
 */
interface KVNamespace {
  put(key: string, value: string): Promise<void>;
  get(key: string): Promise<string | null>;
}

/**
 * Example of a Cloudflare Workers environment
 */
interface WorkersEnv {
  TEST_RESULTS: KVNamespace;
}

/**
 * Example of a Cloudflare Workers fetch handler
 */
export default {
  async fetch(request: Request, env: WorkersEnv): Promise<Response> {
    // Create a file writer function that uses KV storage
    const workerFileWriter = async (path: string, content: string): Promise<void> => {
      await env.TEST_RESULTS.put(path, content);
      // In Workers, console.log is allowed and doesn't trigger linter warnings
      // eslint-disable-next-line no-console
      console.log(`JSON report stored in KV with key: ${path}`);
    };
    
    // Create a JSON formatter with KV storage
    const formatter = new JsonFormatter(
      { 
        outputFile: 'cucumber-report.json',
        includeSource: true,
        includeAttachments: true
      },
      // eslint-disable-next-line no-console
      console.log,
      workerFileWriter
    );
    
    // Start the formatter
    formatter.start();
    
    // Add some example scenarios
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
    
    // End the formatter to generate the report
    formatter.end();
    
    // Get the stored report from KV
    const report = await env.TEST_RESULTS.get('cucumber-report.json');
    
    // Return the report as the response
    return new Response(report, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

/**
 * Example of how to use the JSON formatter in a Workers test
 * 
 * This function demonstrates how to use the JSON formatter in a test
 * that runs in the Workers environment.
 */
export async function runTestsInWorkers(): Promise<string> {
  // Create an in-memory storage for test results
  const storage = new Map<string, string>();
  
  // Create a file writer function that uses the in-memory storage
  const workerFileWriter = async (path: string, content: string): Promise<void> => {
    storage.set(path, content);
  };
  
  // Create a JSON formatter with in-memory storage
  const formatter = new JsonFormatter(
    { 
      outputFile: 'cucumber-report.json',
      includeSource: false,
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
  
  // Return the stored report
  return storage.get('cucumber-report.json') || '';
} 