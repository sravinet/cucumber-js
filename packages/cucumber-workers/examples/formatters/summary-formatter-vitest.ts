/**
 * Example of using the Summary Formatter with Vitest
 * 
 * This example demonstrates how to use the Summary Formatter
 * to display a detailed summary of test results.
 */

import { createCucumberTest } from '../../src/vitest.js';
import { SummaryFormatter } from '../../src/formatters/summary-formatter.js';

// Import step definitions
import '../step_definitions/calculator_steps.js';

// Feature file content
const featureContent = `
Feature: Calculator
  In order to avoid silly mistakes
  As a math idiot
  I want to be told the sum of two numbers

  Scenario: Add two numbers
    Given I have entered 50 into the calculator
    And I have entered 70 into the calculator
    When I press add
    Then the result should be 120 on the screen

  Scenario: Subtract two numbers
    Given I have entered 100 into the calculator
    And I have entered 50 into the calculator
    When I press subtract
    Then the result should be 50 on the screen
`;

// Create a test with the Summary Formatter
createCucumberTest(test, {
  name: 'Calculator with Summary Formatter',
  features: [
    {
      path: 'features/calculator.feature',
      content: featureContent
    }
  ],
  formatters: [
    { type: 'summary' }
  ]
});

// Create a test with a custom Summary Formatter instance
const customFormatter = new SummaryFormatter({ 
  colors: true,
  showFailedSteps: true,
  showUndefinedSteps: true,
  showPendingSteps: true
});

createCucumberTest(test, {
  name: 'Calculator with Custom Summary Formatter',
  features: [
    {
      path: 'features/calculator.feature',
      content: featureContent
    }
  ],
  formatters: [
    { 
      type: 'summary',
      formatter: customFormatter 
    }
  ]
}); 