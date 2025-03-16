/**
 * Example of using the Progress Formatter with Vitest
 * 
 * This example demonstrates how to use the Progress Formatter
 * to display test progress in a minimal format.
 */

import { createCucumberTest } from '../../src/vitest.js';
import { ProgressFormatter } from '../../src/formatters/progress-formatter.js';

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

// Create a test with the Progress Formatter
createCucumberTest(test, {
  name: 'Calculator with Progress Formatter',
  features: [
    {
      path: 'features/calculator.feature',
      content: featureContent
    }
  ],
  formatters: [
    { type: 'progress' }
  ]
});

// Create a test with a custom Progress Formatter instance
const customFormatter = new ProgressFormatter({ colors: true });

createCucumberTest(test, {
  name: 'Calculator with Custom Progress Formatter',
  features: [
    {
      path: 'features/calculator.feature',
      content: featureContent
    }
  ],
  formatters: [
    { 
      type: 'progress',
      formatter: customFormatter 
    }
  ]
}); 