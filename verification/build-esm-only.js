#!/usr/bin/env node

/**
 * Build ESM Only Script
 * 
 * This script copies the ESM files to the lib directory without TypeScript compilation.
 * It's used for verification purposes only.
 */

import { mkdir, copyFile, existsSync } from 'node:fs';
import { promisify } from 'node:util';
import { dirname } from 'node:path';

const mkdirAsync = promisify(mkdir);
const copyFileAsync = promisify(copyFile);

// Files to copy
const files = [
  { src: 'src/wrapper.mjs', dest: 'lib/wrapper.mjs' },
  { src: 'src/esm.mjs', dest: 'lib/esm.mjs' },
  { src: 'src/api/wrapper.mjs', dest: 'lib/api/wrapper.mjs' }
];

/**
 * Ensures a directory exists, creating it if necessary
 * @param {string} dir - Directory path
 */
async function ensureDir(dir) {
  if (!existsSync(dir)) {
    // eslint-disable-next-line no-console
    console.log(`Creating directory: ${dir}`);
    await mkdirAsync(dir, { recursive: true });
  }
}

/**
 * Main function to copy ESM files
 */
async function copyEsmFiles() {
  try {
    // Ensure directories exist
    await ensureDir('lib');
    await ensureDir('lib/api');
    
    // eslint-disable-next-line no-console
    console.log('Copying ESM files...');
    
    // Copy all files
    for (const { src, dest } of files) {
      await ensureDir(dirname(dest));
      await copyFileAsync(src, dest);
      // eslint-disable-next-line no-console
      console.log(`✓ Copied ${src} to ${dest}`);
    }
    
    // eslint-disable-next-line no-console
    console.log('ESM files copied successfully!');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error copying ESM files:', error);
    process.exit(1);
  }
}

// Run the main function
copyEsmFiles(); 