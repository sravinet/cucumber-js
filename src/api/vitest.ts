/**
 * Vitest adapter for Cucumber.js
 * 
 * This module provides integration between Cucumber.js and Vitest,
 * allowing features and step definitions to be executed within Vitest's environment.
 */

import { EventEmitter } from 'node:events'
import { Envelope } from '@cucumber/messages'
import { IVitestOptions } from '../esm'
import { IRunOptions, IRunResult } from './types'
import { runCucumber } from './run_cucumber'

/**
 * Options for running Cucumber tests in Vitest
 */
export interface IVitestRunOptions extends IRunOptions {
  /**
   * Vitest-specific options
   */
  vitest?: IVitestOptions
  /**
   * Name of the test
   */
  name?: string
}

/**
 * Extended run result with messages
 */
export interface IVitestRunResult extends IRunResult {
  /**
   * Cucumber messages emitted during the run
   */
  messages: Envelope[]
}

/**
 * Run Cucumber tests in Vitest's environment
 * 
 * @param options - Options for the run
 * @returns The result of the Cucumber test run
 */
export async function runCucumberInVitest(
  options: IVitestRunOptions
): Promise<IVitestRunResult> {
  const vitestOptions = options.vitest || {}
  
  // Create an event emitter for Cucumber messages
  const eventEmitter = new EventEmitter()
  
  // Set up hooks if provided
  if (vitestOptions.hooks?.beforeAll) {
    await vitestOptions.hooks.beforeAll()
  }
  
  try {
    // Run Cucumber with Vitest-specific environment settings
    const environment = {
      // Vitest runs in a worker thread, so we need to ensure proper environment
      cwd: process.cwd(),
      stdout: process.stdout,
      stderr: process.stderr,
      env: process.env,
    }
    
    // Set up message handling
    const messages: Envelope[] = []
    const onMessage = (message: Envelope) => {
      messages.push(message)
      eventEmitter.emit('message', message)
    }
    
    // Run Cucumber
    const result = await runCucumber(options, environment, onMessage)
    
    return {
      ...result,
      messages,
    }
  } finally {
    // Run afterAll hook if provided
    if (vitestOptions.hooks?.afterAll) {
      await vitestOptions.hooks.afterAll()
    }
  }
}

/**
 * Create a Vitest test that runs Cucumber features
 * 
 * This function is intended to be used with Vitest's test API to create a test
 * that runs Cucumber features and reports the results to Vitest.
 * 
 * @param testFn - Vitest's test function
 * @param options - Options for the Cucumber run
 */
export function createVitestCucumberTest(
  testFn: (name: string, fn: () => Promise<void>) => void,
  options: IVitestRunOptions
): void {
  const testName = options.name || 'Run Cucumber features'
  
  testFn(testName, async () => {
    const result = await runCucumberInVitest(options)
    
    // If the test failed, throw an error to make Vitest fail the test
    if (!result.success) {
      throw new Error('Cucumber tests failed')
    }
  })
} 