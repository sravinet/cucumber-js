# Vitest Integration

Cucumber.js can be integrated with [Vitest](https://vitest.dev/), allowing you to run Cucumber features and step definitions within Vitest's environment.

## Prerequisites

- Node.js 18 or newer
- Cucumber.js version X.X.X or newer
- Vitest

## Installation

```bash
npm install --save-dev @cucumber/cucumber vitest
```

## Basic Usage

### Step 1: Configure Vitest

Create a `vitest.config.js` or `vitest.config.ts` file:

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Your Vitest configuration
    include: ['**/*.{cucumber,feature,test}.{js,ts}'],
    // Optional: Configure environment
    environment: 'node'
  }
})
```

### Step 2: Create a Test File

Create a test file that will run your Cucumber features:

```javascript
// cucumber.test.js
import { test, expect } from 'vitest'
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

### Step 3: Run the Tests

```bash
npx vitest
```

## Enhanced Vitest Adapter (New)

Cucumber.js now provides an enhanced Vitest adapter that offers deeper integration with Vitest.

### Using the createVitestCucumberTest Helper

The simplest way to use the adapter is with the `createVitestCucumberTest` helper:

```javascript
// cucumber.test.js
import { test } from 'vitest'
import { createVitestCucumberTest } from '@cucumber/cucumber/esm'

createVitestCucumberTest(test, {
  name: 'My feature tests',
  paths: ['features/'],
  import: ['features/step_definitions/**/*.js', 'features/support/**/*.js'],
  format: ['summary']
})
```

### Using runCucumberInVitest Directly

For more control, you can use the `runCucumberInVitest` function directly:

```javascript
// cucumber.test.js
import { test, describe, beforeAll, afterAll } from 'vitest'

describe('Cucumber tests', () => {
  beforeAll(() => {
    // Setup code
  })
  
  test('Run features', async ({ expect }) => {
    const { runCucumberInVitest } = await import('@cucumber/cucumber/esm')
    
    const result = await runCucumberInVitest({
      paths: ['features/'],
      import: ['features/step_definitions/**/*.js', 'features/support/**/*.js'],
      format: ['summary'],
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
    expect(testCaseFinishedMessages.length).toBeGreaterThan(0)
  })
  
  afterAll(() => {
    // Teardown code
  })
})
```

### Vitest Adapter Options

The Vitest adapter accepts the following options:

```typescript
interface IVitestOptions {
  // The Vitest environment to use
  vitestEnvironment?: 'node' | 'jsdom' | 'happy-dom' | 'edge-runtime'
  
  // Custom hooks for Vitest integration
  hooks?: {
    // Hook called before Cucumber tests are run
    beforeAll?: () => void | Promise<void>
    
    // Hook called after Cucumber tests are run
    afterAll?: () => void | Promise<void>
  }
}
```

## Advanced Usage

### Custom World

You can use a custom World object with Vitest:

```javascript
// features/support/world.js
import { setWorldConstructor } from '@cucumber/cucumber/esm'

class CustomWorld {
  constructor() {
    this.variable = 0
  }
  
  setTo(number) {
    this.variable = number
  }
  
  incrementBy(number) {
    this.variable += number
  }
}

setWorldConstructor(CustomWorld)
```

### Hooks

You can use Cucumber hooks with Vitest:

```javascript
// features/support/hooks.js
import { Before, After } from '@cucumber/cucumber/esm'

Before(async function() {
  // Setup code
})

After(async function() {
  // Teardown code
})
```

### TypeScript Support

For TypeScript support, ensure your `tsconfig.json` is configured for ESM:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Node",
    // Other options...
  }
}
```

## Troubleshooting

### ESM Issues

If you encounter issues with ESM imports, ensure:

1. Your `package.json` has `"type": "module"` or your files use the `.mjs` extension
2. You're using the `/esm` entry point: `import { ... } from '@cucumber/cucumber/esm'`

### Vitest Environment

If your tests require a specific environment (like DOM manipulation), configure Vitest to use the appropriate environment:

```javascript
// vitest.config.js
export default defineConfig({
  test: {
    environment: 'jsdom' // or 'happy-dom', 'node', etc.
  }
})
```

## Examples

See the [examples directory](https://github.com/cucumber/cucumber-js/tree/main/examples/vitest) for basic examples and [examples/vitest-enhanced](https://github.com/cucumber/cucumber-js/tree/main/examples/vitest-enhanced) for examples using the enhanced Vitest adapter. 