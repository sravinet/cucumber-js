import { test } from 'vitest';
import { createCucumberTest } from '@cucumber/cucumber-workers/vitest';
import './step-definitions/calculator-steps';

// Import the feature file
import calculatorFeature from './features/calculator.feature';

// Create a Cucumber test with source mapping enabled
createCucumberTest(test, {
  name: 'Calculator features with source mapping',
  features: [calculatorFeature],
  runtime: {
    useSourceMaps: true
  },
  sourceMaps: {
    includeSourceContent: true,
    filterStackTraces: true
  },
  formatters: [
    { type: 'progress' },
    { type: 'summary' }
  ]
}); 