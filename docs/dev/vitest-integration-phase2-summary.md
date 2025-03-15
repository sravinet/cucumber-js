# Cucumber.js ESM and Vitest Integration - Phase 2 Summary

## Completed Tasks

### 1. Created Vitest Adapter

- **Created `src/api/vitest.ts`**: Developed a Vitest-specific adapter that handles integration between Cucumber.js and Vitest
- **Added TypeScript Interfaces**: Created `IVitestRunOptions` and `IVitestRunResult` interfaces for type safety
- **Implemented Core Functions**:
  - `runCucumberInVitest`: Runs Cucumber tests in Vitest's environment with enhanced features
  - `createVitestCucumberTest`: Helper function to simplify creating Vitest tests for Cucumber features

### 2. Enhanced Runtime Compatibility

- **Environment Handling**: Ensured Cucumber's runtime works within Vitest's worker threads
- **Message Collection**: Added support for collecting and accessing Cucumber messages
- **Custom Hooks**: Implemented hooks for setup and teardown within the Vitest environment

### 3. Feature and Step Definition Loading

- **File System Integration**: Enhanced file discovery to work with Vitest's file system
- **Module Resolution**: Ensured proper handling of ESM imports in step definitions
- **Error Handling**: Improved error reporting for file loading issues

### 4. Documentation and Examples

- **Updated Documentation**: Enhanced `docs/vitest.md` with information about the new Vitest adapter
- **Created Enhanced Example**: Added `examples/vitest-enhanced` with a comprehensive example using the new adapter
- **Added Usage Examples**: Provided examples of both simple and advanced usage patterns

## Enhanced Example

The enhanced example demonstrates:

1. Using the `createVitestCucumberTest` helper for simple integration
2. Using `runCucumberInVitest` directly for more control
3. Accessing and asserting on Cucumber messages
4. Using custom hooks for setup and teardown
5. Integration with Vitest's test lifecycle

## API Enhancements

### Two-Tiered API Design

The Vitest adapter provides two different functions to balance simplicity and flexibility:

#### 1. `createVitestCucumberTest`

This is a higher-level helper function designed for simplicity. It:
- Takes Vitest's test function and options for the Cucumber run
- Creates a Vitest test that runs Cucumber features with a single function call
- Automatically fails the test if any Cucumber scenarios fail
- Requires minimal boilerplate code

Example usage:
```javascript
import { test } from 'vitest'
import { createVitestCucumberTest } from '@cucumber/cucumber/esm'

createVitestCucumberTest(test, {
  name: 'My feature tests',
  sources: { paths: ['features/'] },
  support: { import: ['features/step_definitions/**/*.js'] }
})
```

#### 2. `runCucumberInVitest`

This is a lower-level function that gives more control to the user. It:
- Runs Cucumber features in Vitest's environment and returns the result
- Allows custom assertions or processing on the result
- Provides access to all Cucumber messages emitted during the run
- Supports custom hooks for setup and teardown
- Offers more flexibility for advanced use cases

Example usage:
```javascript
import { test } from 'vitest'
import { runCucumberInVitest } from '@cucumber/cucumber/esm'

test('Run features', async ({ expect }) => {
  const result = await runCucumberInVitest({
    sources: { paths: ['features/'] },
    support: { import: ['features/step_definitions/**/*.js'] }
  })
  
  expect(result.success).toBe(true)
  expect(result.messages.length).toBeGreaterThan(0)
})
```

This two-tiered API design ensures that both beginners and advanced users can effectively integrate Cucumber.js with Vitest according to their needs.

### New Types

- `IVitestRunOptions`: Options for running Cucumber tests in Vitest
- `IVitestRunResult`: Result of running Cucumber tests in Vitest
- `IVitestOptions`: Vitest-specific options for Cucumber integration

## Next Steps (Phase 3)

1. **Comprehensive Testing**: Create specific tests for the Vitest adapter
2. **Performance Optimization**: Optimize the adapter for better performance
3. **Reporting Integration**: Enhance integration with Vitest's reporting system
4. **Documentation Refinement**: Further improve documentation with more examples and best practices
5. **Step Definition Loading**: Improve step definition loading in non-dry run mode

## Conclusion

Phase 2 of the Vitest integration plan has been successfully completed. The Vitest adapter provides a robust integration between Cucumber.js and Vitest, allowing features and step definitions to be executed within Vitest's environment with enhanced capabilities. The two-tiered API design ensures that both beginners and advanced users can effectively use the integration according to their needs. 