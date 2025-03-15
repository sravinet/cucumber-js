import { test, expect } from 'vitest'
import { runCucumberInVitest } from '@cucumber/cucumber/vitest'

test('Run calculator feature', async () => {
  const result = await runCucumberInVitest({
    sources: {
      paths: ['features/calculator.feature'],
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
  
  // Assert that all scenarios passed
  expect(result.success).toBe(true)
}) 