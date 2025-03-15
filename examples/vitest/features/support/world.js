import { setWorldConstructor } from '@cucumber/cucumber/esm'

/**
 * Custom world object for the calculator example
 */
class CalculatorWorld {
  constructor() {
    this.numbers = []
    this.result = 0
  }

  /**
   * Enter a number into the calculator
   * @param {number} number - The number to enter
   */
  enter(number) {
    this.numbers.push(number)
  }

  /**
   * Add the entered numbers
   */
  add() {
    this.result = this.numbers.reduce((sum, number) => sum + number, 0)
  }

  /**
   * Subtract the second number from the first
   */
  subtract() {
    this.result = this.numbers[0] - this.numbers[1]
  }

  /**
   * Multiply the entered numbers
   */
  multiply() {
    this.result = this.numbers.reduce((product, number) => product * number, 1)
  }

  /**
   * Divide the first number by the second
   */
  divide() {
    this.result = this.numbers[0] / this.numbers[1]
  }

  /**
   * Clear the calculator
   */
  clear() {
    this.numbers = []
    this.result = 0
  }
}

setWorldConstructor(CalculatorWorld) 