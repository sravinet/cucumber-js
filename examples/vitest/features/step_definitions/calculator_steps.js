import { Given, When, Then, Before } from '@cucumber/cucumber/vitest'
import { strict as assert } from 'node:assert'

// Clear the calculator before each scenario
Before(function() {
  this.clear()
})

Given('I have entered {int} into the calculator', function(number) {
  this.enter(number)
})

When('I press add', function() {
  this.add()
})

When('I press subtract', function() {
  this.subtract()
})

When('I press multiply', function() {
  this.multiply()
})

When('I press divide', function() {
  this.divide()
})

Then('the result should be {int} on the screen', function(expectedResult) {
  assert.equal(this.result, expectedResult)
}) 