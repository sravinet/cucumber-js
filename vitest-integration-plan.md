# Cucumber.js ESM and Vitest Integration Plan

## Overview

This document outlines the plan to make Cucumber.js fully compatible with ESM (ECMAScript Modules) and integrate with Vitest, allowing features and step definitions to be executed within Vitest's environment.

## Current State of ESM Support

The codebase already has partial ESM support:

1. **Existing ESM Implementation**:
   - The project has a `src/wrapper.mjs` file that exports Cucumber functions
   - There's documentation about ESM usage in `docs/esm.md`
   - Tests for ESM functionality in `features/esm.feature` and `features/loaders.feature`
   - Support for `.mjs` files detection

2. **Configuration Options**:
   - The `import` option for loading ESM files
   - The `loader` option for transpilers that output ESM

3. **TypeScript Configuration**:
   - The project's `tsconfig.json` uses `"module": "node16"` which supports ESM

## Challenges for Vitest Integration

1. **Module Format Consistency**:
   - Cucumber.js currently supports both CommonJS and ESM, but mixing them can be tricky
   - Vitest is built on Vite which primarily uses ESM

2. **API Compatibility**:
   - The current ESM exports need to be complete and match the CommonJS exports
   - Some internal APIs might need to be exposed for Vitest integration

3. **Runtime Environment**:
   - Vitest has its own runtime environment that differs from Node.js
   - Cucumber's runtime needs to work within Vitest's worker threads

4. **File Discovery and Loading**:
   - Cucumber has its own mechanism for discovering feature files and step definitions
   - This needs to work with Vitest's file loading system

## Implementation Plan

### Phase 1: Complete ESM API Surface

1. **Audit Current ESM Support**:
   - Review all exports in `src/index.ts` and ensure they're available in `src/wrapper.mjs`
   - Check for any internal APIs that might be needed for Vitest integration
   - Ensure all public APIs have proper TypeScript types for ESM usage

2. **Enhance ESM Entry Point**:
   - Update or create a comprehensive ESM entry point
   - Ensure all necessary APIs are exported
   - Add proper type declarations for ESM imports

### Phase 2: Vitest Integration Layer

1. **Create Vitest Adapter**:
   - Develop a Vitest-specific adapter that handles integration
   - This would manage the lifecycle between Cucumber and Vitest
   - Handle differences in test discovery and execution

2. **Runtime Compatibility**:
   - Ensure Cucumber's runtime works within Vitest's worker threads
   - Handle any environment differences between Node.js and Vitest

3. **Feature and Step Definition Loading**:
   - Enhance the file discovery mechanism to work with Vitest's file system
   - Support Vitest's module resolution for step definitions
   - Ensure proper handling of ESM imports in step definitions

### Phase 3: Testing and Documentation

1. **Testing Strategy**:
   - Create specific tests for Vitest integration
   - Ensure existing ESM tests pass with the new implementation
   - Add integration tests that verify the full workflow

2. **Update Documentation**:
   - Add specific documentation for Vitest integration
   - Update ESM documentation to include Vitest usage
   - Provide examples of different setup configurations

## Timeline

- **Phase 1**: 2 weeks
- **Phase 2**: 3 weeks
- **Phase 3**: 1 week

## Success Criteria

1. All Cucumber.js APIs are available via ESM imports
2. Features and step definitions can be executed within Vitest
3. Existing tests continue to pass
4. New integration tests verify the Vitest workflow
5. Documentation is updated with clear examples 