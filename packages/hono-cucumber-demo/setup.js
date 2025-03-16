#!/usr/bin/env node

/**
 * Setup script for Hono Cucumber Demo
 * This script replaces the setup.sh bash script with a cross-platform JavaScript solution
 */

/* eslint-disable no-console */
/* eslint-env node */

import { execSync } from 'node:child_process';

console.log('Setting up Hono Cucumber Demo...');

// Install dependencies
console.log('Installing dependencies...');
try {
  execSync('pnpm install', { stdio: 'inherit' });
} catch (error) {
  console.error('Error installing dependencies:', error.message);
  process.exit(1);
}

// Build the cucumber-workers package
console.log('Building cucumber-workers package...');
try {
  execSync('pnpm run build-cucumber-workers', { stdio: 'inherit' });
} catch (error) {
  console.error('Error building cucumber-workers package:', error.message);
  process.exit(1);
}

// Create KV namespace for local development
console.log('Creating KV namespace for local development...');
try {
  // Check if wrangler is installed
  execSync('npx wrangler --version', { stdio: 'pipe' });
  
  // Create KV namespaces
  execSync('npx wrangler kv:namespace create COUNTER --preview', { stdio: 'inherit' });
  execSync('npx wrangler kv:namespace create COUNTER', { stdio: 'inherit' });
} catch (error) {
  console.warn('Warning: Could not create KV namespaces. You may need to create them manually.');
  console.warn('Run the following commands:');
  console.warn('  npx wrangler kv:namespace create COUNTER --preview');
  console.warn('  npx wrangler kv:namespace create COUNTER');
}

// Update wrangler.toml with KV namespace IDs if needed
// This would require parsing the output of the wrangler commands
// and updating the wrangler.toml file, which is beyond the scope of this example

console.log('Setup complete!');
console.log('You can now run the application with: pnpm run dev');
console.log('Run tests with: pnpm test'); 