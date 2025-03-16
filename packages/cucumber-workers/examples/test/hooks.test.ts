import { test } from 'vitest';
import { createCucumberTest } from '../../src/vitest.js';
import hooksFeature from '../features/hooks.feature';

// Run all scenarios
createCucumberTest(test, {
  name: 'All scenarios with hooks',
  features: [hooksFeature]
});

// Run only database scenarios
createCucumberTest(test, {
  name: 'Database scenarios only',
  features: [hooksFeature],
  tagExpression: '@database'
});

// Run only API scenarios
createCucumberTest(test, {
  name: 'API scenarios only',
  features: [hooksFeature],
  tagExpression: '@api'
});

// Run scenarios that have both database and API tags
createCucumberTest(test, {
  name: 'Database and API scenarios',
  features: [hooksFeature],
  tagExpression: '@database and @api'
}); 