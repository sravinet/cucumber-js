/**
 * Example demonstrating the JSON formatter
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { JsonFormatter } from '../../src/formatters/json-formatter.js';
import { TestStatus } from '../../src/formatters/basic-formatter.js';

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
const formatter = new JsonFormatter(
  { 
    outputFile: 'reports/cucumber-report.json',
    includeSource: true,
    includeAttachments: true
  },
  // eslint-disable-next-line no-console
  console.log,
  fileWriter
);

// Start the formatter
formatter.start();

// Add some example scenarios
formatter.addScenario({
  name: 'Adding two numbers',
  featurePath: 'features/calculator.feature',
  line: 10,
  status: TestStatus.PASSED,
  steps: [
    {
      text: 'Given I have entered 50 into the calculator',
      status: TestStatus.PASSED,
      duration: 5
    },
    {
      text: 'And I have entered 70 into the calculator',
      status: TestStatus.PASSED,
      duration: 3
    },
    {
      text: 'When I press add',
      status: TestStatus.PASSED,
      duration: 10
    },
    {
      text: 'Then the result should be 120 on the screen',
      status: TestStatus.PASSED,
      duration: 7
    }
  ]
});

formatter.addScenario({
  name: 'Subtracting two numbers',
  featurePath: 'features/calculator.feature',
  line: 20,
  status: TestStatus.FAILED,
  steps: [
    {
      text: 'Given I have entered 50 into the calculator',
      status: TestStatus.PASSED,
      duration: 4
    },
    {
      text: 'And I have entered 30 into the calculator',
      status: TestStatus.PASSED,
      duration: 3
    },
    {
      text: 'When I press subtract',
      status: TestStatus.PASSED,
      duration: 8
    },
    {
      text: 'Then the result should be 20 on the screen',
      status: TestStatus.FAILED,
      duration: 6,
      error: 'Expected 20 but got 10'
    }
  ]
});

formatter.addScenario({
  name: 'User login',
  featurePath: 'features/authentication.feature',
  line: 5,
  status: TestStatus.PASSED,
  steps: [
    {
      text: 'Given I am on the login page',
      status: TestStatus.PASSED,
      duration: 15
    },
    {
      text: 'When I enter valid credentials',
      status: TestStatus.PASSED,
      duration: 20
    },
    {
      text: 'And I click the login button',
      status: TestStatus.PASSED,
      duration: 10
    },
    {
      text: 'Then I should be logged in',
      status: TestStatus.PASSED,
      duration: 25
    }
  ]
});

// End the formatter to generate the report
formatter.end();

// eslint-disable-next-line no-console
console.log('JSON formatter example completed.'); 