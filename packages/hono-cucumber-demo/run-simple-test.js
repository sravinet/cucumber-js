#!/usr/bin/env node

/**
 * This script runs the tests without using the Cloudflare Workers pool
 * It's useful when you're having issues with the Cloudflare Workers pool
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if node_modules exists
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

// Possible paths to vitest binary
const possiblePaths = [
  // Local node_modules
  path.join(__dirname, 'node_modules', '.bin', 'vitest'),
  path.join(__dirname, 'node_modules', 'vitest', 'vitest.mjs'),
  path.join(__dirname, 'node_modules', 'vitest', 'dist', 'index.js'),
  path.join(__dirname, 'node_modules', 'vitest', 'dist', 'cli.js'),
  
  // Root node_modules (for monorepo setups)
  path.join(__dirname, '..', '..', 'node_modules', '.bin', 'vitest'),
  path.join(__dirname, '..', '..', 'node_modules', 'vitest', 'vitest.mjs'),
  path.join(__dirname, '..', '..', 'node_modules', 'vitest', 'dist', 'index.js'),
  path.join(__dirname, '..', '..', 'node_modules', 'vitest', 'dist', 'cli.js')
];

// Find the first path that exists
let vitestPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    vitestPath = p;
    break;
  }
}

if (!vitestPath) {
  console.error('Could not find vitest executable. Try installing it:');
  console.error('pnpm install -D vitest');
  process.exit(1);
}

// Run vitest with the simple configuration, targeting only the simple.test.ts file
console.log(`Running vitest with: ${vitestPath} run test/simple.test.ts`);
try {
  if (vitestPath.endsWith('.js') || vitestPath.endsWith('.mjs')) {
    execSync(`node ${vitestPath} run test/simple.test.ts`, { stdio: 'inherit' });
  } else {
    execSync(`${vitestPath} run test/simple.test.ts`, { stdio: 'inherit' });
  }
} catch (error) {
  console.error('Error running vitest:', error.message);
  process.exit(1);
} 