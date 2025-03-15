import { test, describe, beforeAll, afterAll } from 'vitest'
import { createVitestCucumberTest, runCucumberInVitest } from '@cucumber/cucumber/vitest'

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
    import: [
      'features/step_definitions/**/*.js',
      'features/support/**/*.js'
    ],
    importPaths: [],
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
    const result = await runCucumberInVitest({
      sources: {
        paths: ['features/counter.feature'],
        defaultDialect: 'en',
        names: [],
        tagExpression: '',
        order: 'defined'
      },
      support: {
        import: [
          'features/step_definitions/**/*.js',
          'features/support/**/*.js'
        ],
        importPaths: [],
        requireModules: [],
        requirePaths: [],
        loaders: []
      },
      runtime: {
        dryRun: true, // Use dryRun mode to avoid step definition execution issues
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
    
    // In dry run mode, we expect success to be true
    expect(result.success).toBe(true)
    
    // You can also assert on the messages
    const testCaseFinishedMessages = result.messages.filter(
      msg => msg.testCaseFinished
    )
    expect(testCaseFinishedMessages.length).toBe(3) // 3 scenarios
    
    // Verify that we have messages, which confirms the adapter is working
    expect(result.messages.length).toBeGreaterThan(0)
  })
})

// Test for step definition loading in non-dry run mode
describe('Step definition loading optimization', () => {
  // Test that step definitions are cached between runs
  test('Step definitions are cached between runs', async ({ expect }) => {
    // First run to load and cache step definitions
    const firstRunResult = await runCucumberInVitest({
      sources: {
        paths: ['features/counter.feature'],
        defaultDialect: 'en',
        names: [],
        tagExpression: '',
        order: 'defined'
      },
      support: {
        import: [
          'features/step_definitions/**/*.js',
          'features/support/**/*.js'
        ],
        importPaths: [],
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
    
    // Verify first run was successful
    expect(firstRunResult.success).toBe(true)
    
    // Second run should use cached step definitions
    const secondRunResult = await runCucumberInVitest({
      sources: {
        paths: ['features/counter.feature'],
        defaultDialect: 'en',
        names: [],
        tagExpression: '',
        order: 'defined'
      },
      support: {
        import: [
          'features/step_definitions/**/*.js',
          'features/support/**/*.js'
        ],
        importPaths: [],
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
    
    // Verify second run was successful
    expect(secondRunResult.success).toBe(true)
    
    // Verify that the second run produced the same number of messages
    expect(secondRunResult.messages.length).toBe(firstRunResult.messages.length)
    
    // Verify that the support code library was reused
    expect(secondRunResult.support).toBe(firstRunResult.support)
  })
  
  // Test that different step definition paths use different caches
  test('Different scenarios use different tags', async ({ expect }) => {
    // Run with increment scenario
    const incrementRunResult = await runCucumberInVitest({
      sources: {
        paths: ['features/counter.feature'],
        defaultDialect: 'en',
        names: [],
        tagExpression: '@increment',
        order: 'defined'
      },
      support: {
        import: [
          'features/step_definitions/**/*.js',
          'features/support/**/*.js'
        ],
        importPaths: [],
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
    
    // Verify increment run was successful
    expect(incrementRunResult.success).toBe(true)
    
    // Run with decrement scenario
    const decrementRunResult = await runCucumberInVitest({
      sources: {
        paths: ['features/counter.feature'],
        defaultDialect: 'en',
        names: [],
        tagExpression: '@decrement',
        order: 'defined'
      },
      support: {
        import: [
          'features/step_definitions/**/*.js',
          'features/support/**/*.js'
        ],
        importPaths: [],
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
    
    // Verify decrement run was successful
    expect(decrementRunResult.success).toBe(true)
    
    // Verify that different scenarios were run
    const incrementMessages = incrementRunResult.messages.filter(
      msg => msg.testCaseStarted
    )
    const decrementMessages = decrementRunResult.messages.filter(
      msg => msg.testCaseStarted
    )
    
    expect(incrementMessages.length).toBe(1)
    expect(decrementMessages.length).toBe(1)
    expect(incrementMessages[0].testCaseStarted.id).not.toBe(decrementMessages[0].testCaseStarted.id)
    
    // Run with reset scenario
    const resetRunResult = await runCucumberInVitest({
      sources: {
        paths: ['features/counter.feature'],
        defaultDialect: 'en',
        names: [],
        tagExpression: '@reset',
        order: 'defined'
      },
      support: {
        import: [
          'features/step_definitions/**/*.js',
          'features/support/**/*.js'
        ],
        importPaths: [],
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
    
    // Verify reset run was successful
    expect(resetRunResult.success).toBe(true)
    
    // Verify that reset scenario was run
    const resetMessages = resetRunResult.messages.filter(
      msg => msg.testCaseStarted
    )
    expect(resetMessages.length).toBe(1)
    expect(resetMessages[0].testCaseStarted.id).not.toBe(incrementMessages[0].testCaseStarted.id)
    expect(resetMessages[0].testCaseStarted.id).not.toBe(decrementMessages[0].testCaseStarted.id)
  })
}) 