import { setWorldConstructor } from '@cucumber/cucumber/esm'
import { Counter } from '../../src/counter.js'

/**
 * Custom world object for counter tests
 */
class CounterWorld {
  constructor() {
    this.counter = new Counter()
    this.lastResult = null
  }

  /**
   * Set the counter to a specific value
   * @param {number} value - The value to set
   */
  setCounter(value) {
    this.counter.setValue(value)
  }

  /**
   * Increment the counter
   */
  incrementCounter() {
    this.lastResult = this.counter.increment()
  }

  /**
   * Decrement the counter
   */
  decrementCounter() {
    this.lastResult = this.counter.decrement()
  }

  /**
   * Reset the counter
   */
  resetCounter() {
    this.lastResult = this.counter.reset()
  }

  /**
   * Get the current counter value
   * @returns {number} The current counter value
   */
  getCounterValue() {
    return this.counter.getValue()
  }
}

setWorldConstructor(CounterWorld) 