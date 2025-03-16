#!/usr/bin/env node

/**
 * This script links the cucumber-workers package to the hono-cucumber-demo package
 */

/* eslint-disable no-console */
/* eslint-env node */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the cucumber-workers package
const cucumberWorkersPath = path.resolve(__dirname, '../cucumber-workers');
const cucumberWorkersDistPath = path.resolve(cucumberWorkersPath, 'dist');

console.log('Linking cucumber-workers package...');

// Check if the cucumber-workers package is built
if (!fs.existsSync(path.join(cucumberWorkersDistPath, 'esm', 'vitest.js'))) {
  console.warn('Warning: cucumber-workers package is not built. Building it now...');
  
  try {
    // Navigate to the cucumber-workers directory and build it
    process.chdir(cucumberWorkersPath);
    execSync('pnpm run build', { stdio: 'inherit' });
    console.log('Successfully built cucumber-workers package.');
    
    // Navigate back to the original directory
    process.chdir(__dirname);
  } catch (error) {
    console.error('Error building cucumber-workers package:', error.message);
    process.exit(1);
  }
}

// Create a node_modules/@cucumber directory if it doesn't exist
const nodeModulesPath = path.join(__dirname, 'node_modules');
const cucumberPath = path.join(nodeModulesPath, '@cucumber');

if (!fs.existsSync(nodeModulesPath)) {
  console.log('Creating node_modules directory...');
  fs.mkdirSync(nodeModulesPath, { recursive: true });
}

if (!fs.existsSync(cucumberPath)) {
  console.log('Creating @cucumber directory...');
  fs.mkdirSync(cucumberPath, { recursive: true });
}

// Create a symlink to the cucumber-workers package
const cucumberWorkersLinkPath = path.join(cucumberPath, 'cucumber-workers');

// Remove the existing symlink if it exists
if (fs.existsSync(cucumberWorkersLinkPath)) {
  console.log('Removing existing symlink...');
  fs.unlinkSync(cucumberWorkersLinkPath);
}

// Create a new symlink
console.log(`Creating symlink from ${cucumberWorkersPath} to ${cucumberWorkersLinkPath}...`);
fs.symlinkSync(cucumberWorkersPath, cucumberWorkersLinkPath, 'dir');

console.log('Successfully linked cucumber-workers package.');
console.log('You can now run the tests with:');
console.log('  pnpm run test:all'); 