/**
 * Step definitions for calculator example
 */
import { Given, When, Then } from '../../../src/index.js';

// Define a custom world type
class CalculatorWorld {
  a: number = 0;
  b: number = 0;
  result: number = 0;
}

// Given steps
Given('I have entered {int} into the calculator', function(this: CalculatorWorld, num: number) {
  if (this.a === 0) {
    this.a = num;
  } else {
    this.b = num;
  }
});

// When steps
When('I press add', function(this: CalculatorWorld) {
  this.result = this.a + this.b;
});

When('I press subtract', function(this: CalculatorWorld) {
  this.result = this.a - this.b;
});

When('I press multiply', function(this: CalculatorWorld) {
  this.result = this.a * this.b;
});

When('I press divide', function(this: CalculatorWorld) {
  if (this.b === 0) {
    throw new Error('Division by zero');
  }
  this.result = this.a / this.b;
});

// Then steps
Then('the result should be {int} on the screen', function(this: CalculatorWorld, expected: number) {
  if (this.result !== expected) {
    throw new Error(`Expected ${expected} but got ${this.result}`);
  }
}); 