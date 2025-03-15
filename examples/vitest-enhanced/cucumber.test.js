import { test, describe, beforeAll, afterAll } from 'vitest'
import { createVitestCucumberTest } from '@cucumber/cucumber/esm'

// Example of using the createVitestCucumberTest helper
createVitestCucumberTest(test, {
  name: 'Counter feature',
  sources: {
    paths: ['features/counter.feature'],
    defaultDialect: 'en',
    names: [],
    tagExpression: '',
    order: 'defined'
  },
  support: {
    importPaths: [
      './features/step_definitions/counter_steps.js',
      './features/support/world.js'
    ],
    requireModules: [],
    requirePaths: [],
    loaders: []
  },
  runtime: {
    dryRun: false,
    failFast: false,
    filterStacktraces: true,
    parallel: 0,
    retry: 0,
    retryTagFilter: '',
    strict: false,
    worldParameters: {}
  },
  formats: {
    stdout: 'summary',
    files: {},
    publish: false,
    options: {}
  }
})

// Example of using the adapter with more control
describe('Counter tests with hooks', () => {
  // Setup and teardown hooks
  beforeAll(() => {
    // Setup code for Counter tests
  })
  
  afterAll(() => {
    // Cleanup code for Counter tests
  })
  
  // Run the Cucumber tests
  test('Counter feature with custom hooks', async ({ expect }) => {
    const { runCucumberInVitest } = await import('@cucumber/cucumber/esm')
    
    const result = await runCucumberInVitest({
      sources: {
        paths: ['features/counter.feature'],
        defaultDialect: 'en',
        names: [],
        tagExpression: '',
        order: 'defined'
      },
      support: {
        importPaths: [
          './features/step_definitions/counter_steps.js',
          './features/support/world.js'
        ],
        requireModules: [],
        requirePaths: [],
        loaders: []
      },
      runtime: {
        dryRun: false,
        failFast: false,
        filterStacktraces: true,
        parallel: 0,
        retry: 0,
        retryTagFilter: '',
        strict: false,
        worldParameters: {}
      },
      formats: {
        stdout: 'summary',
        files: {},
        publish: false,
        options: {}
      },
      vitest: {
        vitestEnvironment: 'node',
        hooks: {
          beforeAll: () => { /* Before Cucumber tests */ },
          afterAll: () => { /* After Cucumber tests */ }
        }
      }
    })
    
    // Assert on the result
    expect(result.success).toBe(true)
    
    // You can also assert on the messages
    const testCaseFinishedMessages = result.messages.filter(
      msg => msg.testCaseFinished
    )
    expect(testCaseFinishedMessages.length).toBe(3) // 3 scenarios
  })
}) 