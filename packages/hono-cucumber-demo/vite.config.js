/* eslint-env node */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if the cucumber-workers package is linked
const nodeModulesPath = path.join(__dirname, 'node_modules');
const cucumberWorkersPath = path.join(nodeModulesPath, '@cucumber', 'cucumber-workers');
const cucumberWorkersDistPath = path.join(cucumberWorkersPath, 'dist');
const vitestFilePath = path.join(cucumberWorkersDistPath, 'esm', 'vitest.js');

if (!fs.existsSync(vitestFilePath)) {
  console.warn('Warning: cucumber-workers package is not linked. Run "pnpm run link-cucumber-workers" first.');
}

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
}); 