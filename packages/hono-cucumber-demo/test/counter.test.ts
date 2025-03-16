import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { describe, it } from 'vitest';
import { createCucumberTest } from '@cucumber/cucumber-workers/vitest';

// Import step definitions
import '../features/step_definitions/counter.steps.js';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the feature file
const featureFilePath = path.join(__dirname, '../features/counter.feature');
const counterFeature = fs.readFileSync(featureFilePath, 'utf-8');

describe('Counter API Tests', () => {
  // Create a Cucumber test
  createCucumberTest(it, {
    name: 'should run counter scenarios',
    features: [
      {
        path: 'features/counter.feature',
        content: counterFeature
      }
    ],
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
}); 