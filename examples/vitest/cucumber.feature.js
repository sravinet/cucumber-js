import { test, expect } from 'vitest'
import { runCucumber } from '@cucumber/cucumber/esm'

test('Run calculator feature', async () => {
  const result = await runCucumber({
    paths: ['features/calculator.feature'],
    import: ['features/step_definitions/**/*.js', 'features/support/**/*.js'],
    format: ['summary']
  })
  
  // Assert that all scenarios passed
  expect(result.success).toBe(true)
}) 