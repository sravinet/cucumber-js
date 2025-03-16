import { test } from 'vitest';
import { createCucumberTest } from '../../src/vitest.js';
import taggedFeature from '../features/tagged.feature';

// Run only smoke tests
createCucumberTest(test, {
  name: 'Smoke tests only',
  features: [taggedFeature],
  tagExpression: '@smoke'
});

// Run smoke tests that are not slow
createCucumberTest(test, {
  name: 'Fast smoke tests only',
  features: [taggedFeature],
  tagExpression: '@smoke and not @slow'
});

// Run regression or e2e tests
createCucumberTest(test, {
  name: 'Regression or E2E tests',
  features: [taggedFeature],
  tagExpression: '@regression or @e2e'
}); 