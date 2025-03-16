#!/usr/bin/env node

/**
 * This script directly runs vitest from the node_modules directory
 * It's useful when npx or pnpx aren't working correctly
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  console.log('Could not find vitest executable. Trying to install it...');
  try {
    execSync('pnpm install -D vitest', { stdio: 'inherit' });
    console.log('Vitest installed successfully! Trying to find it again...');
    
    // Try to find vitest again after installation
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        vitestPath = p;
        break;
      }
    }
    
    if (!vitestPath) {
      console.error('Still could not find vitest executable after installation.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Failed to install vitest:', error.message);
    console.error('Try installing it manually:');
    console.error('pnpm install -D vitest');
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2).join(' ') || 'run';

// Run vitest
console.log(`Running vitest with: ${vitestPath} ${args}`);
try {
  if (vitestPath.endsWith('.js') || vitestPath.endsWith('.mjs')) {
    execSync(`node ${vitestPath} ${args}`, { stdio: 'inherit' });
  } else {
    execSync(`${vitestPath} ${args}`, { stdio: 'inherit' });
  }
} catch (error) {
  console.error('Error running vitest:', error.message);
  process.exit(1);
} 