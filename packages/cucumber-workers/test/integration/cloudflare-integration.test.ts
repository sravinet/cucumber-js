/**
 * Integration test for Cucumber Workers in Cloudflare Workers environment
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it } from 'vitest';
import { createCucumberTest } from '../../src/vitest.js';

// Import step definitions
import '../step_definitions/cloudflare_steps.js';

// Read the feature file
const featureContent = readFileSync(
  resolve(__dirname, '../features/cloudflare.feature'),
  'utf-8'
);

describe('Cucumber Workers in Cloudflare', () => {
  // Create a Cucumber test with the feature file
  createCucumberTest(it, {
    name: 'should run Cucumber tests in Cloudflare Workers',
    features: [
      {
        path: 'test/features/cloudflare.feature',
        content: featureContent
      }
    ],
    // Pass world parameters
    worldParameters: {
      debug: true
    },
    // Configure runtime options
    runtime: {
      dryRun: false,
      failFast: false
    },
    // Filter scenarios with tags
    tagExpression: '@cloudflare and not @slow'
  });
}); 