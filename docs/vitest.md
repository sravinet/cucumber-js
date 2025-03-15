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

## Enhanced Vitest Adapter

Cucumber.js provides an enhanced Vitest adapter that offers deeper integration with Vitest.

### Using the createVitestCucumberTest Helper

The simplest way to use the adapter is with the `createVitestCucumberTest` helper:

```javascript
// cucumber.test.js
import { test } from 'vitest'
import { createVitestCucumberTest } from '@cucumber/cucumber/esm'

createVitestCucumberTest(test, {
  name: 'My feature tests',
  sources: {
    paths: ['features/'],
    defaultDialect: 'en',
    names: [],
    tagExpression: '',
    order: 'defined'
  },
  support: {
    importPaths: ['features/step_definitions/**/*.js', 'features/support/**/*.js'],
    requirePaths: [],
    requireModules: [],
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
      sources: {
        paths: ['features/'],
        defaultDialect: 'en',
        names: [],
        tagExpression: '',
        order: 'defined'
      },
      support: {
        importPaths: ['features/step_definitions/**/*.js', 'features/support/**/*.js'],
        requirePaths: [],
        requireModules: [],
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

## Best Practices

### 1. Reusing Support Code Libraries

The Vitest adapter includes performance optimizations that cache support code libraries between test runs. To take advantage of this:

```javascript
// Use the same support code paths across multiple test runs
const supportPaths = {
  importPaths: ['features/step_definitions/**/*.js', 'features/support/**/*.js']
}

// First test
createVitestCucumberTest(test, {
  name: 'Feature A',
  sources: { paths: ['features/featureA.feature'], /* ... */ },
  support: supportPaths,
  // ...
})

// Second test - will reuse the cached support code library
createVitestCucumberTest(test, {
  name: 'Feature B',
  sources: { paths: ['features/featureB.feature'], /* ... */ },
  support: supportPaths,
  // ...
})
```

### 2. Organizing Tests

For larger projects, organize your tests by feature or domain:

```javascript
// auth.cucumber.test.js
import { describe, test } from 'vitest'
import { createVitestCucumberTest } from '@cucumber/cucumber/esm'

describe('Authentication', () => {
  createVitestCucumberTest(test, {
    name: 'Login features',
    sources: { paths: ['features/auth/login.feature'], /* ... */ },
    // ...
  })
  
  createVitestCucumberTest(test, {
    name: 'Registration features',
    sources: { paths: ['features/auth/registration.feature'], /* ... */ },
    // ...
  })
})
```

### 3. Detailed Error Reporting

The Vitest adapter provides detailed error reporting for failed scenarios. When a test fails, you'll see:

- The name of the failed scenario
- The file and line number where the failure occurred
- The error message from the step that failed

This makes it easier to identify and fix issues.

### 4. Parallel Execution

For faster test execution, you can use Vitest's worker threads:

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.cucumber.test.js'],
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false
      }
    }
  }
})
```

### 5. Step Definition Loading Optimization

To improve performance, especially in larger projects:

1. Organize step definitions by feature or domain
2. Only load the step definitions needed for each test
3. Use the caching mechanism by reusing support code libraries

```javascript
// Only load relevant step definitions
createVitestCucumberTest(test, {
  name: 'Authentication features',
  sources: { paths: ['features/auth/**/*.feature'] },
  support: {
    importPaths: ['features/step_definitions/auth/**/*.js', 'features/support/**/*.js']
  },
  // ...
})
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

### Step Definition Not Found

If you're getting "Step definition not found" errors:

1. Check that your import paths are correct
2. Ensure your step definitions are being loaded before the scenarios run
3. Try using `requirePaths` instead of `importPaths` if you're using CommonJS modules

### Debugging

For debugging Cucumber tests in Vitest:

```javascript
// cucumber.test.js
import { test } from 'vitest'
import { createVitestCucumberTest } from '@cucumber/cucumber/esm'

createVitestCucumberTest(test, {
  name: 'Debug test',
  sources: { paths: ['features/failing.feature'] },
  support: { importPaths: ['features/step_definitions/**/*.js'] },
  runtime: {
    // Enable for more verbose output
    filterStacktraces: false
  },
  formats: {
    // Use a more detailed formatter
    stdout: 'progress',
    files: {
      './cucumber-report.json': 'json'
    }
  }
})
```

## Examples

See the [examples directory](https://github.com/cucumber/cucumber-js/tree/main/examples/vitest) for basic examples and [examples/vitest-enhanced](https://github.com/cucumber/cucumber-js/tree/main/examples/vitest-enhanced) for examples using the enhanced Vitest adapter. 