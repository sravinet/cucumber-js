import { Given, When, Then } from '@cucumber/cucumber/vitest'
import { expect } from 'vitest'

Given('the counter is at {int}', function(value) {
  this.setCounter(value)
})

When('I increment the counter', function() {
  this.incrementCounter()
})

When('I decrement the counter', function() {
  this.decrementCounter()
})

When('I reset the counter', function() {
  this.resetCounter()
})

Then('the counter should be {int}', function(expected) {
  const actual = this.getCounterValue()
  expect(actual).toBe(expected)
}) 