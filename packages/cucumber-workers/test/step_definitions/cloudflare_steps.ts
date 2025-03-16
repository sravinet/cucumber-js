/**
 * Step definitions for Cloudflare Workers tests
 */
import { Given, When, Then } from '../../src/index.js';

// Add type declaration for Cloudflare Workers globals
declare global {
  interface Window {
    caches?: unknown;
    Miniflare?: unknown;
  }
}

// Custom world type for Cloudflare tests
interface CloudflareWorld {
  environment: string;
  testExecuted: boolean;
  testResult: boolean;
  data?: Array<{ name: string; value: string }>;
  input?: number;
  output?: number;
  kvNamespace?: any;
}

// Environment check steps
Given('I am running in a Cloudflare Workers environment', function(this: CloudflareWorld) {
  this.environment = 'cloudflare';
  
  // Verify we're in a Cloudflare-like environment
  const isCloudflareEnv = typeof (globalThis as any).caches !== 'undefined' || 
                         typeof (globalThis as any).Miniflare !== 'undefined';
  
  if (!isCloudflareEnv) {
    throw new Error('Not running in a Cloudflare Workers environment');
  }
});

// Test execution steps
When('I execute a test', function(this: CloudflareWorld) {
  this.testExecuted = true;
  this.testResult = true;
});

When('I execute a slow test', function(this: CloudflareWorld) {
  this.testExecuted = true;
  this.testResult = true;
  
  // Simulate a slow test
  const start = Date.now();
  while (Date.now() - start < 100) {
    // Busy wait to simulate slow execution
  }
});

// Data table steps
Given('I have the following data:', function(this: CloudflareWorld, dataTable: any) {
  this.data = dataTable.hashes();
});

When('I process the data', function(this: CloudflareWorld) {
  if (!this.data) {
    throw new Error('No data to process');
  }
  
  this.testExecuted = true;
  this.testResult = this.data.length > 0;
});

// Parameterized test steps
Given('I have {int} as input', function(this: CloudflareWorld, input: number) {
  this.input = input;
});

When('I process it in Workers', function(this: CloudflareWorld) {
  if (this.input === undefined) {
    throw new Error('No input to process');
  }
  
  this.output = this.input * 2;
  this.testExecuted = true;
});

Then('I should get {int} as output', function(this: CloudflareWorld, expected: number) {
  if (this.output === undefined) {
    throw new Error('No output was produced');
  }
  
  if (this.output !== expected) {
    throw new Error(`Expected output to be ${expected}, but got ${this.output}`);
  }
  
  this.testResult = true;
});

// Result verification steps
Then('I should get the expected results', function(this: CloudflareWorld) {
  if (!this.testExecuted) {
    throw new Error('Test was not executed');
  }
  
  if (!this.testResult) {
    throw new Error('Test did not pass');
  }
});

Then('it should pass', function(this: CloudflareWorld) {
  if (!this.testExecuted) {
    throw new Error('Test was not executed');
  }
  
  if (!this.testResult) {
    throw new Error('Test did not pass');
  }
}); 