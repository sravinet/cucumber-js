import { Given, When, Then } from '@cucumber/cucumber-workers';
import { expect } from 'vitest';

// Define the World interface
interface CucumberWorld {
  calculator: Calculator;
}

class Calculator {
  values: number[] = [];
  result: number = 0;

  add() {
    this.result = this.values.reduce((sum, value) => sum + value, 0);
  }

  subtract() {
    if (this.values.length === 0) {
      this.result = 0;
    } else {
      this.result = this.values[0] - this.values.slice(1).reduce((sum, value) => sum + value, 0);
    }
  }
}

Given('I have entered {int} into the calculator', function(this: CucumberWorld, value: number) {
  this.calculator = this.calculator || new Calculator();
  this.calculator.values.push(value);
});

When('I press add', function(this: CucumberWorld) {
  this.calculator.add();
});

When('I press subtract', function(this: CucumberWorld) {
  this.calculator.subtract();
});

Then('the result should be {int} on the screen', function(this: CucumberWorld, expectedResult: number) {
  // Intentional error: we're comparing with the wrong value to demonstrate source mapping
  expect(this.calculator.result).toBe(expectedResult);
}); 