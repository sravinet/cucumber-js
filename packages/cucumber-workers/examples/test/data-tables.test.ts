import { test } from 'vitest';
import { createCucumberTest } from '../../src/vitest.js';
import dataTablesFeature from '../features/data-tables.feature';

// Run all data table scenarios
createCucumberTest(test, {
  name: 'Data Tables Examples',
  features: [dataTablesFeature]
}); 