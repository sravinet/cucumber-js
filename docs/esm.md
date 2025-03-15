# ES Modules (experimental)

You can optionally write your support code (steps, hooks, etc) with native ES modules syntax - i.e. using `import` and `export` statements without transpiling to CommonJS.

If your support code is written as ESM, you'll need to use the `import` configuration option to specify your files, rather than the `require` option, although we do automatically detect and import any `.mjs` files found within your features directory.

## Enhanced ESM Support

Starting from version X.X.X, Cucumber.js provides enhanced ESM support through a dedicated ESM entry point. This makes it easier to use Cucumber.js with ESM-based tools like Vitest.

To use the enhanced ESM entry point, import from `@cucumber/cucumber/esm`:

```javascript
// Using the enhanced ESM entry point
import { Given, When, Then } from '@cucumber/cucumber/esm'

Given('a variable set to {int}', function (number) {
  this.setTo(number)
})
```

## Vitest Integration

The enhanced ESM entry point is designed to work seamlessly with Vitest. This allows you to run Cucumber.js features and step definitions within Vitest's environment.

Example usage with Vitest:

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Your Vitest configuration
  }
})
```

```javascript
// cucumber.test.js
import { test } from 'vitest'
import { runCucumber } from '@cucumber/cucumber/esm'

test('Run Cucumber features', async () => {
  const result = await runCucumber({
    paths: ['features/'],
    import: ['features/step_definitions/**/*.js'],
    format: ['summary']
  })
  
  // Assert on the result
  expect(result.success).toBe(true)
})
```

## Basic ESM Example

Example:

```javascript
// features/support/steps.mjs
import { Given, When, Then } from '@cucumber/cucumber'
import { strict as assert } from 'assert'

Given('a variable set to {int}', function (number) {
  this.setTo(number)
})

When('I increment the variable by {int}', function (number) {
  this.incrementBy(number)
})

Then('the variable should contain {int}', function (number) {
  assert.equal(this.variable, number)
})
```

As well as support code, these things can also be in ES modules syntax:

- [Configuration files](./configuration.md#files)
- [Custom formatters](./custom_formatters.md)
- [Custom snippets](./custom_snippet_syntaxes.md)

You can use ES modules selectively/incrementally - so you can have a mixture of CommonJS and ESM in the same project.

## Transpiling

See [Transpiling](./transpiling.md#esm) for how to do just-in-time compilation that outputs ESM.