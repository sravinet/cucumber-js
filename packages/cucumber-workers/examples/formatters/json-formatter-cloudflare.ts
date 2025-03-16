/**
 * Example demonstrating the JSON formatter in a Cloudflare Workers environment
 * 
 * This example follows the patterns from the Cloudflare Workers SDK and shows
 * how to use the JSON formatter in a production Workers environment.
 */

import { JsonFormatter } from '../../src/formatters/json-formatter.js';
import { TestStatus } from '../../src/formatters/basic-formatter.js';

/**
 * Type definitions for Cloudflare Workers
 */
export interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

export interface DurableObjectNamespace {
  newUniqueId(options?: { jurisdiction?: string }): DurableObjectId;
  idFromName(name: string): DurableObjectId;
  idFromString(id: string): DurableObjectId;
}

export interface DurableObjectId {
  toString(): string;
}

/**
 * Interface for KV namespace
 */
export interface KVNamespace {
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  get(key: string, options?: { type?: 'text' | 'json' | 'arrayBuffer' | 'stream' }): Promise<any>;
  list(options?: { prefix?: string, limit?: number, cursor?: string }): Promise<{ keys: { name: string, expiration?: number }[], list_complete: boolean, cursor?: string }>;
}

/**
 * Interface for Cloudflare Workers environment
 */
export interface Env {
  // KV Namespace for storing test results
  CUCUMBER_RESULTS: KVNamespace;
  
  // Optional: Environment variables
  CUCUMBER_CONFIG?: string;
  
  // Optional: Durable Object namespace
  TEST_SESSIONS?: DurableObjectNamespace;
}

/**
 * Worker handler
 */
export default {
  /**
   * Main fetch handler for the Worker
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle different routes
    if (url.pathname === '/run-tests') {
      return handleRunTests(request, env, ctx);
    } else if (url.pathname === '/reports') {
      return handleGetReports(request, env);
    } else if (url.pathname.startsWith('/report/')) {
      const reportId = url.pathname.replace('/report/', '');
      return handleGetReport(reportId, env);
    }
    
    // Default response with usage instructions
    return new Response(
      JSON.stringify({
        endpoints: [
          { path: '/run-tests', method: 'POST', description: 'Run Cucumber tests' },
          { path: '/reports', method: 'GET', description: 'List available test reports' },
          { path: '/report/{id}', method: 'GET', description: 'Get a specific test report' }
        ]
      }, null, 2),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};

/**
 * Handle running tests
 */
async function handleRunTests(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  // Create a unique ID for this test run
  const testRunId = crypto.randomUUID();
  const reportKey = `report-${testRunId}.json`;
  
  // Create a file writer function that uses KV storage
  const workerFileWriter = async (path: string, content: string): Promise<void> => {
    await env.CUCUMBER_RESULTS.put(reportKey, content);
    // Use ctx.waitUntil to log after response is sent
    ctx.waitUntil(
      (async () => {
        // eslint-disable-next-line no-console
        console.log(`Test report stored with key: ${reportKey}`);
      })()
    );
  };
  
  // Create a JSON formatter
  const formatter = new JsonFormatter(
    { 
      outputFile: reportKey,
      includeSource: true,
      includeAttachments: true
    },
    // Use a no-op function for output to avoid console warnings
    () => {},
    workerFileWriter
  );
  
  // Start the formatter
  formatter.start();
  
  try {
    // Parse test configuration from request body
    const config = await request.json();
    
    // In a real implementation, you would run actual Cucumber tests here
    // For this example, we'll simulate some test scenarios
    await simulateTestRun(formatter, config);
    
    // End the formatter to generate the report
    formatter.end();
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        reportId: testRunId,
        reportUrl: `/report/${testRunId}`
      }),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    // Handle errors
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

/**
 * Handle getting a list of reports
 */
async function handleGetReports(request: Request, env: Env): Promise<Response> {
  try {
    // List all reports in the KV namespace
    const reports = await env.CUCUMBER_RESULTS.list({ prefix: 'report-' });
    
    // Format the response
    const formattedReports = reports.keys.map(key => {
      const reportId = key.name.replace('report-', '').replace('.json', '');
      return {
        id: reportId,
        url: `/report/${reportId}`,
        expiration: key.expiration
      };
    });
    
    // Return the list of reports
    return new Response(
      JSON.stringify(formattedReports),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    // Handle errors
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

/**
 * Handle getting a specific report
 */
async function handleGetReport(reportId: string, env: Env): Promise<Response> {
  try {
    // Get the report from KV
    const reportKey = `report-${reportId}.json`;
    const report = await env.CUCUMBER_RESULTS.get(reportKey, { type: 'text' });
    
    if (!report) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Report with ID ${reportId} not found`
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Return the report
    return new Response(report, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    // Handle errors
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

/**
 * Simulate running tests
 */
async function simulateTestRun(formatter: JsonFormatter, config: any): Promise<void> {
  // Simulate some delay for test execution
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Add a passing scenario
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
  
  // Add a failing scenario
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
  
  // If config specifies additional scenarios, add them
  if (config?.additionalScenarios) {
    for (let i = 0; i < config.additionalScenarios; i++) {
      formatter.addScenario({
        name: `Dynamic Scenario ${i + 1}`,
        featurePath: 'features/dynamic.feature',
        line: 10 + i * 10,
        status: i % 5 === 0 ? TestStatus.FAILED : TestStatus.PASSED,
        steps: [
          {
            text: `Given I have dynamic step ${i + 1}`,
            status: TestStatus.PASSED,
            duration: 5
          },
          {
            text: `When I execute dynamic step ${i + 1}`,
            status: i % 5 === 0 ? TestStatus.FAILED : TestStatus.PASSED,
            duration: 10,
            error: i % 5 === 0 ? `Dynamic step ${i + 1} failed` : undefined
          }
        ]
      });
    }
  }
} 