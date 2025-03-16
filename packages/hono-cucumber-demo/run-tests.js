#!/usr/bin/env node

/**
 * This script runs the tests for the Hono Cucumber Demo
 * with proper error handling and dependency checks
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
  console.log('node_modules not found, installing dependencies first...');
  try {
    execSync('pnpm install', { stdio: 'inherit' });
    console.log('Dependencies installed successfully!');
  } catch (error) {
    console.error('Error installing dependencies:', error.message);
    process.exit(1);
  }
}

// Try to run the tests
console.log('Running tests...');
try {
  // First try with npx vitest
  execSync('npx vitest run', { stdio: 'inherit' });
} catch (error) {
  console.log('Error running tests with npx vitest, trying alternative method...');
  
  try {
    // Try with pnpx vitest
    execSync('pnpx vitest run', { stdio: 'inherit' });
  } catch (secondError) {
    console.log('Error running tests with pnpx vitest, trying direct path...');
    
    try {
      // Try with node directly
      const vitestPath = path.join(__dirname, 'node_modules', '.bin', 'vitest');
      if (fs.existsSync(vitestPath)) {
        execSync(`${vitestPath} run`, { stdio: 'inherit' });
      } else {
        console.error('Could not find vitest executable. Try installing it globally:');
        console.error('pnpm install -g vitest');
        process.exit(1);
      }
    } catch (error) {
      console.error('Error running tests:', error.message);
      console.error('Please try running the tests manually:');
      console.error('1. Make sure you have vitest installed globally: pnpm install -g vitest');
      console.error('2. Run: vitest run');
      process.exit(1);
    }
  }
} 