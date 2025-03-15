# Cucumber.js Vitest Integration Verification

This directory contains scripts and tools to verify the Cucumber.js Vitest integration.

## Scripts

- `esm-verification.mjs`: Verifies that the ESM entry point is working correctly
- `examples-verification.js`: Verifies that the example projects are correctly set up
- `docs-verification.js`: Verifies that the documentation has been updated

## Running the Verification

To run all verification scripts, use:

```bash
npm run verify-phase1
```

Or run individual verification scripts:

```bash
npm run verify-esm
npm run verify-examples
npm run verify-docs
```

## Checklist

See `phase1-checklist.md` for a comprehensive checklist of all the tasks that need to be completed for Phase 1. 