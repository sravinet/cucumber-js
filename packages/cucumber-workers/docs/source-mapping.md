# Source Mapping for Error Stack Traces

This document describes the source mapping feature in Cucumber Workers, which maps error stack traces back to feature files and step definitions for better error reporting.

## Overview

When running Cucumber tests in the Cloudflare Workers environment, error stack traces can be difficult to debug because they point to compiled JavaScript code rather than the original feature files or step definitions. The source mapping feature addresses this issue by:

1. Mapping error stack traces back to the original source locations
2. Including relevant source code snippets in the error output
3. Filtering out irrelevant stack frames to focus on user code

## How It Works

The source mapping feature uses the `source-map` library to map compiled JavaScript locations back to the original source files. The process works as follows:

1. Source maps are generated during the build process by the Vite plugin
2. When an error occurs during test execution, the error stack trace is parsed
3. Each stack frame is mapped back to its original source location
4. The mapped stack trace is formatted with source code snippets
5. The formatted stack trace is included in the error output

## Usage

### Enabling Source Mapping

Source mapping is enabled by default, but you can explicitly configure it in your test file:

```typescript
import { test } from 'vitest';
import { createCucumberTest } from '@cucumber/cucumber-workers/vitest';
import './step-definitions/calculator-steps';
import calculatorFeature from './features/calculator.feature';

createCucumberTest(test, {
  name: 'Calculator features with source mapping',
  features: [calculatorFeature],
  runtime: {
    useSourceMaps: true // Enable source mapping (default is true)
  },
  sourceMaps: {
    includeSourceContent: true, // Include source code snippets (default is true)
    filterStackTraces: true // Filter out irrelevant stack frames (default is true)
  }
});
```

### Configuration Options

The source mapping feature can be configured with the following options:

#### Runtime Options

- `useSourceMaps` (boolean): Whether to use source maps for error stack traces. Default: `true`

#### Source Map Options

- `includeSourceContent` (boolean): Whether to include source code snippets in the error output. Default: `true`
- `filterStackTraces` (boolean): Whether to filter out irrelevant stack frames. Default: `true`

### Example Output

When an error occurs during test execution, the error stack trace will be mapped back to the original source locations. For example:

```
Error: Expected result to be 120, but got 120
    at Then (features/calculator.feature:10:5)
        Then the result should be 120 on the screen
        ^
    at Object.<anonymous> (step-definitions/calculator-steps.ts:30:11)
        throw new Error(`Expected result to be ${expectedResult}, but got ${calculator.result}`);
              ^
```

This makes it much easier to identify the source of the error and fix the issue.

## Implementation Details

### Source Mapper

The `SourceMapper` class is responsible for mapping error stack traces back to original source locations. It provides the following methods:

- `registerSourceMap(filePath, sourceMapContent)`: Registers a source map for a file
- `mapErrorStack(error)`: Maps an error stack trace to original source locations
- `dispose()`: Cleans up resources

### Vite Plugin Integration

The Vite plugin generates source maps for feature files during the build process. The source maps are used by the `SourceMapper` to map error stack traces back to the original feature files.

### Vitest Integration

The Vitest integration uses the `SourceMapper` to map error stack traces before they are reported to the user. This ensures that error messages are as helpful as possible.

## Limitations

- Source mapping only works if source maps are available for the files being executed
- Some error types may not include stack traces that can be mapped
- Source mapping adds a small performance overhead to error handling

## Future Improvements

- Support for more detailed source mapping with column-level precision
- Integration with browser-based debugging tools
- Performance optimizations for large test suites 