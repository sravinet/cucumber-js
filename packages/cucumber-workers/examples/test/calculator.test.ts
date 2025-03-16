/**
 * Calculator test using Cucumber Workers
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'vitest';
import { createCucumberTest } from '../../src/vitest.js';

// Import step definitions
import '../features/step_definitions/calculator_steps.js';

// Load the feature file
const featurePath = path.resolve(__dirname, '../features/calculator.feature');
const featureContent = fs.readFileSync(featurePath, 'utf-8');

// Create a test suite
describe('Calculator Features', () => {
  // Create a Cucumber test
  createCucumberTest(it, {
    name: 'should perform basic arithmetic operations',
    features: [
      {
        path: featurePath,
        content: featureContent
      }
    ],
    // Pass world parameters if needed
    worldParameters: {
      debug: true
    },
    // Configure runtime options
    runtime: {
      dryRun: false,
      failFast: false
    }
  });
}); 