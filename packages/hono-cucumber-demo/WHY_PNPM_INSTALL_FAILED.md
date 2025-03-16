# Why `pnpm install` Failed and How We Fixed It

## The Problem

The initial setup had a conflict between module systems that caused `pnpm install` to fail. The error message was:

```
ReferenceError: require is not defined in ES module scope, you can use import instead
This file is being treated as an ES module because it has a '.js' file extension and '/packages/hono-cucumber-demo/package.json' contains "type": "module".
```

## Root Cause

1. **Module Type Conflict**: The `package.json` had `"type": "module"` which means all `.js` files are treated as ES modules by default. However, our helper scripts (`install-deps.js` and `run-tests.js`) were using CommonJS syntax with `require()` instead of ES module `import` statements.

2. **Script Execution**: When running `pnpm install`, Node attempted to execute the `install-deps.js` script with ES module rules, but the script was written with CommonJS syntax.

## How We Fixed It

1. **Converted Scripts to ES Modules**: We updated our helper scripts to use proper ES module syntax:
   - Changed `require()` to `import` statements
   - Added proper module specifiers (e.g., `node:fs` instead of `fs`)
   - Used `fileURLToPath` and `import.meta.url` to get the current directory (since `__dirname` is not available in ES modules)

2. **Updated Package Commands**: We ensured all scripts in `package.json` are compatible with ES modules.

3. **Consistent Package Manager**: We standardized on using `pnpm` throughout the codebase.

## Example of the Changes

### Before (CommonJS):
```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if node_modules exists
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  // ...
}
```

### After (ES Modules):
```javascript
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if node_modules exists
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  // ...
}
```

## Benefits of Using ES Modules

1. **Modern JavaScript**: ES Modules are the standard module system for modern JavaScript.
2. **Better Tree Shaking**: ES Modules enable better tree shaking for smaller bundle sizes.
3. **Top-level Await**: ES Modules support top-level await.
4. **Strict Mode by Default**: ES Modules run in strict mode by default.
5. **Compatibility**: Better compatibility with modern frameworks and tools.

## Best Practices for ES Modules

1. **Use `.js` Extension in Imports**: Always include the file extension in import statements (e.g., `import x from './y.js'`).
2. **Use `node:` Protocol**: For Node.js built-in modules, use the `node:` protocol (e.g., `import fs from 'node:fs'`).
3. **Replace `__dirname` and `__filename`**: Use `import.meta.url` with `fileURLToPath` to get the current file path.
4. **Use Named Exports**: Prefer named exports over default exports for better tree shaking.

## Conclusion

By ensuring consistent use of ES Modules throughout our codebase, we've fixed the installation issues and created a more modern, maintainable project structure that aligns with current JavaScript best practices. 