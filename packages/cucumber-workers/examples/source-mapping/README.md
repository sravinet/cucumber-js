# Source Mapping Example

This example demonstrates the source mapping feature in Cucumber Workers, which maps error stack traces back to feature files and step definitions for better error reporting.

## Overview

The example includes:

- A simple calculator feature file with two scenarios (addition and subtraction)
- Step definitions with an intentional error to demonstrate source mapping
- A test file that runs the feature with source mapping enabled

## Running the Example

To run the example, use the following command from the root of the cucumber-workers package:

```bash
# Run in Node environment
npm run test -- examples/source-mapping/calculator.test.ts

# Run in Cloudflare Workers environment
npm run test:examples:cloudflare
```

You should see an error output that includes mapped stack traces pointing to the original feature file and step definitions.

## Expected Output

The test will fail with an error similar to the following:

```
Error: Expected result to be 120, but got 120
    at Then (features/calculator.feature:10:5)
        Then the result should be 120 on the screen
        ^
    at Object.<anonymous> (step-definitions/calculator-steps.ts:30:11)
        throw new Error(`Expected result to be ${expectedResult}, but got ${calculator.result}`);
              ^
```

Notice how the error stack trace includes:

1. The original feature file location (line 10, column 5)
2. The source code snippet from the feature file
3. The step definition file location
4. The source code snippet from the step definition

This makes it much easier to identify the source of the error and fix the issue.

## Understanding the Example

### The Error

The error occurs because of an intentional bug in the step definition:

```typescript
Then('the result should be {int} on the screen', function(this: CucumberWorld, expectedResult: number) {
  // Intentional error: we're comparing with the wrong value to demonstrate source mapping
  expect(this.calculator.result).toBe(expectedResult);
});
```

The step definition is using Vitest's `expect` to compare the result with the expected value. In a real scenario, if the values don't match, this would produce a detailed error message with source mapping information.

### Source Mapping Configuration

The source mapping is enabled in the test file:

```typescript
createCucumberTest(test, {
  name: 'Calculator features with source mapping',
  features: [{
    path: 'examples/source-mapping/features/calculator.feature',
    content: calculatorFeature
  }],
  runtime: {
    useSourceMaps: true,
    errorMessages: {
      colors: true,
      includeContext: true,
      contextLines: 3
    }
  },
  sourceMaps: {
    includeSourceContent: true,
    filterStacktraces: true
  },
  formatters: [
    { type: 'progress' },
    { type: 'summary' }
  ]
});
```

## Cloudflare Workers Support

This example also demonstrates how source mapping works in the Cloudflare Workers environment. When running with `npm run test:examples:cloudflare`, the tests execute in a simulated Cloudflare Workers environment using `@cloudflare/vitest-pool-workers`.

The source mapping functionality works the same way in Cloudflare Workers as it does in Node.js, providing detailed error information that helps with debugging.

## Further Reading

For more information about source mapping in Cucumber Workers, see the [source mapping documentation](../../docs/source-mapping.md). 