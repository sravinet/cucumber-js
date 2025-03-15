/**
 * A simple counter class
 */
export class Counter {
  constructor(initialValue = 0) {
    this.value = initialValue;
  }

  /**
   * Increment the counter
   * @returns {number} The new counter value
   */
  increment() {
    return ++this.value;
  }

  /**
   * Decrement the counter
   * @returns {number} The new counter value
   */
  decrement() {
    return --this.value;
  }

  /**
   * Reset the counter to zero
   * @returns {number} The new counter value (always 0)
   */
  reset() {
    this.value = 0;
    return this.value;
  }

  /**
   * Get the current counter value
   * @returns {number} The current counter value
   */
  getValue() {
    return this.value;
  }

  /**
   * Set the counter to a specific value
   * @param {number} value - The value to set
   * @returns {number} The new counter value
   */
  setValue(value) {
    this.value = value;
    return this.value;
  }
} 