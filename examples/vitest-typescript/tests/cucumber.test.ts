import { test, expect } from 'vitest'
import { runCucumber } from '@cucumber/cucumber/esm'

test('Run todo list feature', async () => {
  const result = await runCucumber({
    paths: ['features/todo.feature'],
    import: [
      'tests/step_definitions/**/*.ts',
      'tests/support/**/*.ts'
    ],
    format: ['summary']
  })
  
  // Assert that all scenarios passed
  expect(result.success).toBe(true)
}) 