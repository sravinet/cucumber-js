import { Given, When, Then } from '../../../src/index.js';

// Define the World interface for type safety
interface TestWorld {
  testType: string;
  executed: boolean;
}

Given('I have a smoke test', function(this: TestWorld) {
  this.testType = 'smoke';
});

Given('I have a regression test', function(this: TestWorld) {
  this.testType = 'regression';
});

Given('I have a slow smoke test', function(this: TestWorld) {
  this.testType = 'slow smoke';
});

Given('I have an e2e test', function(this: TestWorld) {
  this.testType = 'e2e';
});

When('I run it', function(this: TestWorld) {
  this.executed = true;
});

Then('it should pass', function(this: TestWorld) {
  if (!this.executed) {
    throw new Error('Test was not executed');
  }
}); 