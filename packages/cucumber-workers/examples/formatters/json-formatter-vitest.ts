/**
 * Example demonstrating the JSON formatter with Vitest integration
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { test } from 'vitest';
import { createCucumberTest } from '../../src/vitest.js';
import { JsonFormatter } from '../../src/formatters/json-formatter.js';
import calculatorFeature from '../features/calculator.feature';
import taggedFeature from '../features/tagged.feature';

// Create a file writer function for the example
const fileWriter = (filePath: string, content: string): void => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf8');
  // eslint-disable-next-line no-console
  console.log(`JSON report written to ${filePath}`);
};

// Create a JSON formatter with file output
const jsonFormatter = new JsonFormatter(
  { 
    outputFile: 'reports/cucumber-report.json',
    includeSource: true,
    includeAttachments: true
  },
  // eslint-disable-next-line no-console
  console.log,
  fileWriter
);

// Run calculator tests with JSON formatter
createCucumberTest(test, {
  name: 'Calculator features with JSON formatter',
  features: [calculatorFeature],
  formatters: [
    {
      type: 'json',
      formatter: jsonFormatter
    }
  ]
});

// Run tagged tests with JSON formatter
createCucumberTest(test, {
  name: 'Tagged features with JSON formatter',
  features: [taggedFeature],
  tagExpression: '@smoke',
  formatters: [
    {
      type: 'json',
      formatter: jsonFormatter
    }
  ]
}); 