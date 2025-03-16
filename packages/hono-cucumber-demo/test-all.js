#!/usr/bin/env node

/**
 * This script tries to run the tests using different methods
 * until one succeeds. It's useful when you're not sure which
 * method will work in your environment.
 */

import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// First, check if node_modules exists and install dependencies if needed
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('node_modules not found, installing dependencies...');
  try {
    execSync('pnpm install', { stdio: 'inherit' });
    console.log('Dependencies installed successfully!');
  } catch (error) {
    console.error('Error installing dependencies:', error.message);
    console.error('Trying to continue anyway...');
  }
}

// Methods to try, in order of preference
const methods = [
  {
    name: 'npx vitest',
    command: 'npx vitest run',
  },
  {
    name: 'pnpx vitest',
    command: 'pnpx vitest run',
  },
  {
    name: 'direct script',
    command: 'node run-vitest.js',
  },
  {
    name: 'alternative script',
    command: 'node run-tests.js',
  },
  {
    name: 'global vitest',
    command: 'vitest run',
  },
];

// Try each method in sequence
console.log('Trying to run tests using different methods...');

for (const method of methods) {
  console.log(`\nTrying method: ${method.name}`);
  console.log(`Command: ${method.command}`);
  
  try {
    execSync(method.command, { stdio: 'inherit' });
    console.log(`\n✅ Success! Tests ran successfully using ${method.name}`);
    process.exit(0);
  } catch (error) {
    console.log(`❌ Failed to run tests using ${method.name}`);
    console.log('Trying next method...');
  }
}

console.error('\n❌ All methods failed. Please check your installation and try again.');
console.error('You might need to install dependencies first:');
console.error('pnpm install');
process.exit(1); 