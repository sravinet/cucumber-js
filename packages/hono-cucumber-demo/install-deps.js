#!/usr/bin/env node

/**
 * This script helps with installing dependencies for the Hono Cucumber Demo
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Installing dependencies for Hono Cucumber Demo...');

// Check if node_modules exists
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('node_modules not found, installing dependencies...');
  try {
    execSync('pnpm install', { stdio: 'inherit' });
    console.log('Dependencies installed successfully!');
  } catch (error) {
    console.error('Error installing dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('node_modules already exists, checking for vitest...');
}

// Check if vitest is installed
try {
  execSync('npx vitest --version', { stdio: 'ignore' });
  console.log('Vitest is installed and available.');
} catch (error) {
  console.log('Vitest not found, installing...');
  try {
    execSync('pnpm install -D vitest', { stdio: 'inherit' });
    console.log('Vitest installed successfully!');
  } catch (error) {
    console.error('Error installing vitest:', error.message);
    process.exit(1);
  }
}

console.log('All dependencies are installed. You can now run:');
console.log('  pnpm run dev   - to start the development server');
console.log('  pnpm test      - to run the tests'); 