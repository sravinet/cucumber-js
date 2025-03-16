/**
 * Step definitions for the counter feature
 * 
 * These step definitions demonstrate how to use Cucumber in Cloudflare Workers.
 */

import { expect } from 'vitest';
// Import directly from the source file during development
import { Given, When, Then } from '../../src/index';

// Counter class that works in Cloudflare Workers
class Counter {
  private value: number;

  constructor(initialValue: number = 0) {
    this.value = initialValue;
  }

  increment(): void {
    this.value++;
  }

  decrement(): void {
    this.value--;
  }

  getValue(): number {
    return this.value;
  }
}

// Define the World interface to fix type issues
interface CucumberWorld {
  counter: Counter;
}

// Step definitions
Given('I have a counter initialized to {int}', function(this: CucumberWorld, initialValue: number) {
  this.counter = new Counter(initialValue);
});

When('I increment the counter', function(this: CucumberWorld) {
  this.counter.increment();
});

When('I decrement the counter', function(this: CucumberWorld) {
  this.counter.decrement();
});

When('I increment the counter {int} times', function(this: CucumberWorld, times: number) {
  for (let i = 0; i < times; i++) {
    this.counter.increment();
  }
});

When('I decrement the counter {int} time(s)', function(this: CucumberWorld, times: number) {
  for (let i = 0; i < times; i++) {
    this.counter.decrement();
  }
});

Then('the counter value should be {int}', function(this: CucumberWorld, expectedValue: number) {
  expect(this.counter.getValue()).toBe(expectedValue);
}); 