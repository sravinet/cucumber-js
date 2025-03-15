/**
 * Vitest adapter for Cucumber.js
 * 
 * This module provides integration between Cucumber.js and Vitest,
 * allowing features and step definitions to be executed within Vitest's environment.
 */

import { EventEmitter } from 'node:events'
import { Envelope, TestCase, TestCaseStarted, TestStepFinished, TestCaseFinished } from '@cucumber/messages'
import { IVitestOptions } from '../esm'
import { IRunOptions, IRunResult, ISupportCodeLibrary } from './types'
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

// Cache for support code libraries to avoid reloading step definitions
const supportCodeCache = new Map<string, ISupportCodeLibrary>()

/**
 * Generate a cache key for the support code library
 * 
 * @param options - Options for the run
 * @returns A cache key for the support code library
 */
function generateCacheKey(options: IVitestRunOptions): string {
  const { support } = options
  
  if ('originalCoordinates' in support) {
    // If we already have a support code library, use its coordinates
    const { importPaths, requirePaths, loaders, requireModules } = support.originalCoordinates
    return JSON.stringify({ importPaths, requirePaths, loaders, requireModules })
  } else {
    // Otherwise, use the support coordinates
    const { importPaths = [], requirePaths = [], loaders = [], requireModules = [] } = support
    return JSON.stringify({ importPaths, requirePaths, loaders, requireModules })
  }
}

/**
 * Extract scenario information from Cucumber messages
 * 
 * @param messages - Cucumber messages
 * @returns Information about scenarios
 */
function extractScenarioInfo(messages: Envelope[]): {
  total: number
  passed: number
  failed: number
  skipped: number
  pending: number
  scenarios: Array<{
    name: string
    status: 'passed' | 'failed' | 'skipped' | 'pending'
    uri: string
    line: number
    error?: Error
  }>
} {
  const scenarios: Array<{
    name: string
    status: 'passed' | 'failed' | 'skipped' | 'pending'
    uri: string
    line: number
    error?: Error
  }> = []
  
  const testCaseStartedMap = new Map<string, { name: string; uri: string; line: number }>()
  const testStepResultMap = new Map<string, { status: string; message?: string }>()
  
  // Process messages to extract scenario information
  for (const message of messages) {
    if (message.testCase) {
      const testCase = message.testCase as TestCase
      const id = testCase.id || ''
      // These properties are dynamically accessed, so we use type assertion
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const testCaseAny = testCase as any
      const name = testCaseAny.name || ''
      const uri = testCaseAny.uri || ''
      const location = testCaseAny.location || {}
      testCaseStartedMap.set(id, { name, uri, line: location.line || 0 })
    } else if (message.testCaseStarted) {
      const testCaseStarted = message.testCaseStarted as TestCaseStarted
      const id = testCaseStarted.id || ''
      const testCaseId = testCaseStarted.testCaseId || ''
      const testCase = testCaseStartedMap.get(testCaseId)
      if (testCase) {
        testCaseStartedMap.set(id, testCase)
      }
    } else if (message.testStepFinished) {
      const testStepFinished = message.testStepFinished as TestStepFinished
      const testCaseStartedId = testStepFinished.testCaseStartedId || ''
      const testStepResult = testStepFinished.testStepResult
      if (testStepResult?.status === 'FAILED') {
        testStepResultMap.set(testCaseStartedId, { 
          status: 'failed',
          message: testStepResult.message
        })
      } else if (testStepResult?.status === 'PENDING' && !testStepResultMap.has(testCaseStartedId)) {
        testStepResultMap.set(testCaseStartedId, { status: 'pending' })
      } else if (testStepResult?.status === 'SKIPPED' && !testStepResultMap.has(testCaseStartedId)) {
        testStepResultMap.set(testCaseStartedId, { status: 'skipped' })
      } else if (testStepResult?.status === 'PASSED' && !testStepResultMap.has(testCaseStartedId)) {
        testStepResultMap.set(testCaseStartedId, { status: 'passed' })
      }
    } else if (message.testCaseFinished) {
      const testCaseFinished = message.testCaseFinished as TestCaseFinished
      const testCaseStartedId = testCaseFinished.testCaseStartedId || ''
      const testCase = testCaseStartedMap.get(testCaseStartedId)
      const result = testStepResultMap.get(testCaseStartedId) || { status: 'passed' }
      
      if (testCase) {
        scenarios.push({
          name: testCase.name,
          status: result.status as any,
          uri: testCase.uri,
          line: testCase.line,
          error: result.message ? new Error(result.message) : undefined
        })
      }
    }
  }
  
  // Calculate summary
  const passed = scenarios.filter(s => s.status === 'passed').length
  const failed = scenarios.filter(s => s.status === 'failed').length
  const skipped = scenarios.filter(s => s.status === 'skipped').length
  const pending = scenarios.filter(s => s.status === 'pending').length
  const total = scenarios.length
  
  return {
    total,
    passed,
    failed,
    skipped,
    pending,
    scenarios
  }
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
    // Check if we can reuse a support code library
    if (!options.runtime?.dryRun && !('originalCoordinates' in options.support)) {
      const cacheKey = generateCacheKey(options)
      const cachedSupport = supportCodeCache.get(cacheKey)
      
      if (cachedSupport) {
        // Use the cached support code library
        options = {
          ...options,
          support: cachedSupport
        }
      }
    }
    
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
    
    // Cache the support code library for future runs
    if (!options.runtime?.dryRun) {
      const cacheKey = generateCacheKey(options)
      supportCodeCache.set(cacheKey, result.support)
    }
    
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
    
    // Extract scenario information for better reporting
    const scenarioInfo = extractScenarioInfo(result.messages)
    
    // If the test failed, throw an error with details to make Vitest fail the test
    if (!result.success) {
      const failedScenarios = scenarioInfo.scenarios
        .filter(s => s.status === 'failed')
        .map(s => `  - ${s.name} (${s.uri}:${s.line})${s.error ? '\n    ' + s.error.message : ''}`)
        .join('\n')
      
      throw new Error(`Cucumber tests failed:\n${failedScenarios}`)
    }
  })
} 