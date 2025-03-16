/**
 * Example of using Cucumber Workers with Vitest
 * 
 * This example demonstrates how to set up and run Cucumber tests
 * in a Cloudflare Workers environment using Vitest.
 */

import { describe, it } from 'vitest';
import { createCucumberTest } from '../src/vitest.js';
import { Given, When, Then } from '../src/index.js';

// Define a custom world object
class CustomWorld {
  cucumberCount: number = 0;
}

// Define step definitions
Given('I have {int} cucumbers', function(this: CustomWorld, count: number) {
  this.cucumberCount = count;
});

When('I eat {int} cucumbers', function(this: CustomWorld, count: number) {
  this.cucumberCount -= count;
});

Then('I should have {int} cucumbers left', function(this: CustomWorld, count: number) {
  if (this.cucumberCount !== count) {
    throw new Error(`Expected ${count} cucumbers, but had ${this.cucumberCount}`);
  }
});

// Define an in-memory feature file
const featureContent = `
Feature: Eating cucumbers
  As a cucumber enthusiast
  I want to track my cucumber consumption
  So that I don't run out of cucumbers

  Scenario: Eating some cucumbers
    Given I have 10 cucumbers
    When I eat 3 cucumbers
    Then I should have 7 cucumbers left

  Scenario: Eating all cucumbers
    Given I have 5 cucumbers
    When I eat 5 cucumbers
    Then I should have 0 cucumbers left
`;

// Create a test suite using Vitest's describe function
describe('Cucumber Tests in Workers', () => {
  // Create a Cucumber test using our custom function
  createCucumberTest(it, {
    name: 'should run cucumber scenarios in a Workers environment',
    features: [
      {
        path: 'features/eating_cucumbers.feature',
        content: featureContent
      }
    ],
    // Pass world parameters if needed
    worldParameters: {
      debug: true
    },
    // Configure runtime options
    runtime: {
      dryRun: false,
      failFast: false
    }
  });
}); 