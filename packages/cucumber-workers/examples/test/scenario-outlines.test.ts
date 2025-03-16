import { test } from 'vitest';
import { createCucumberTest } from '../../src/vitest.js';
import scenarioOutlinesFeature from '../features/scenario-outlines.feature';

// Run all scenarios
createCucumberTest(test, {
  name: 'Scenario Outlines Example',
  features: [scenarioOutlinesFeature]
});

// Run only admin examples
createCucumberTest(test, {
  name: 'Admin Examples Only',
  features: [scenarioOutlinesFeature],
  tagExpression: '@admin'
});

// Run only user examples
createCucumberTest(test, {
  name: 'User Examples Only',
  features: [scenarioOutlinesFeature],
  tagExpression: '@user'
}); 