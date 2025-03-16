import { test } from 'vitest';
import { createCucumberTest } from '@cucumber/cucumber-workers/vitest';
import './step-definitions/calculator-steps';

// Import the feature file
import calculatorFeature from './features/calculator.feature';

// Create a Cucumber test with source mapping enabled
createCucumberTest(test, {
  name: 'Calculator features with source mapping',
  features: [
    {
      path: 'examples/source-mapping/features/calculator.feature',
      content: calculatorFeature
    }
  ],
  runtime: {
    // Use source maps for error stack traces
    useSourceMaps: true,
    // Add enhanced error messages
    errorMessages: {
      colors: true,
      includeContext: true,
      contextLines: 3
    }
  },
  sourceMaps: {
    includeSourceContent: true,
    filterStacktraces: true
  },
  formatters: [
    { type: 'progress' },
    { type: 'summary' }
  ]
}); 