#!/usr/bin/env node

/**
 * Build script for Cucumber Workers
 * 
 * This script builds both ESM and CJS versions of the package.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Ensure the dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Build ESM version
// eslint-disable-next-line no-console
console.log('Building ESM version...');
execSync('tsc -p tsconfig.json', { stdio: 'inherit' });

// Build CJS version
// eslint-disable-next-line no-console
console.log('Building CJS version...');
execSync('tsc -p tsconfig.cjs.json', { stdio: 'inherit' });

// Create CJS package.json files
// eslint-disable-next-line no-console
console.log('Creating CJS package.json files...');
const cjsFiles = walkSync('dist/cjs');
for (const file of cjsFiles) {
  if (file.endsWith('.js')) {
    const dir = path.dirname(file);
    const packageJsonPath = path.join(dir, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      fs.writeFileSync(packageJsonPath, JSON.stringify({
        type: 'commonjs'
      }, null, 2));
    }
  }
}

// eslint-disable-next-line no-console
console.log('Build completed successfully!');

/**
 * Walk a directory recursively and return all files
 * 
 * @param dir - Directory to walk
 * @param fileList - List of files (used for recursion)
 * @returns List of files
 */
function walkSync(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    
    if (stat.isDirectory()) {
      walkSync(filepath, fileList);
    } else {
      fileList.push(filepath);
    }
  }
  
  return fileList;
} 