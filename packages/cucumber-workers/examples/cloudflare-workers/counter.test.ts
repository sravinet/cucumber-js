/**
 * Test file for the counter feature
 * 
 * This file demonstrates how to use Cucumber with Vitest and Cloudflare Workers.
 */

import { describe, it } from 'vitest';
// Import directly from the source file during development
import { createCucumberTest } from '../../src/vitest.ts';

// Import the feature file
import counterFeature from './counter.feature';

// Import step definitions
import './counter.steps';

describe('Counter in Cloudflare Workers', () => {
  // Create a Cucumber test
  createCucumberTest(it, {
    name: 'should run counter scenarios',
    features: [
      {
        path: 'examples/cloudflare-workers/counter.feature',
        content: counterFeature
      }
    ],
    // Filter scenarios by tag
    tagExpression: 'not @slow',
    // Pass parameters to the World
    worldParameters: {
      debug: true
    },
    // Configure runtime options
    runtime: {
      failFast: false,
      useSourceMaps: true,
      errorMessages: {
        colors: true,
        includeContext: true,
        contextLines: 3
      }
    },
    // Configure formatters
    formatters: [
      {
        type: 'progress',
        options: {
          colors: true
        }
      },
      {
        type: 'summary',
        options: {
          colors: true,
          showFailedSteps: true
        }
      }
    ],
    // Configure Workers options
    workers: {
      optimize: true,
      memoryLimit: 128,
      cpuLimit: 10000,
      useWorkersRuntime: true
    }
  });

  // Create another Cucumber test with different options
  createCucumberTest(it, {
    name: 'should run slow scenarios',
    features: [
      {
        path: 'examples/cloudflare-workers/counter.feature',
        content: counterFeature
      }
    ],
    // Only run slow scenarios
    tagExpression: '@slow',
    // Configure formatters
    formatters: [
      {
        type: 'json',
        options: {
          includeSource: true,
          includeAttachments: false
        }
      }
    ],
    // Configure Workers options
    workers: {
      optimize: true,
      memoryLimit: 256, // More memory for slow scenarios
      cpuLimit: 20000, // More CPU time for slow scenarios
      useWorkersRuntime: true
    }
  });
}); 