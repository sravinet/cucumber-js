import { Given, When, Then } from '@cucumber/cucumber-workers';

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

// Create a world object to share state between steps
const calculator = new Calculator();

Given('I have entered {int} into the calculator', function(value: number) {
  calculator.values.push(value);
});

When('I press add', function() {
  calculator.add();
});

When('I press subtract', function() {
  calculator.subtract();
});

Then('the result should be {int} on the screen', function(expectedResult: number) {
  // Intentional error: we're comparing with the wrong value to demonstrate source mapping
  if (calculator.result !== expectedResult + 1) {
    throw new Error(`Expected result to be ${expectedResult}, but got ${calculator.result}`);
  }
}); 