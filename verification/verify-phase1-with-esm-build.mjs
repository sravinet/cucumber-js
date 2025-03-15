#!/usr/bin/env node

/**
 * Phase 1 Verification Script with ESM-only Build
 * 
 * This script runs the ESM-only build and then verifies Phase 1 of the Vitest integration.
 */

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Get the directory of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Run a command and return a promise that resolves when the command completes
 * @param {string} command - The command to run
 * @param {string[]} args - The arguments to pass to the command
 * @returns {Promise<number>} - A promise that resolves with the exit code
 */
function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-console
    console.log(`Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    child.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Main function to run the verification
 */
async function runVerification() {
  try {
    // Step 1: Run the ESM-only build
    // eslint-disable-next-line no-console
    console.log('\n=== Step 1: Running ESM-only build ===\n');
    await runCommand('node', [join(__dirname, 'build-esm-only.mjs')]);
    
    // Step 2: Run the verification script
    // eslint-disable-next-line no-console
    console.log('\n=== Step 2: Running Phase 1 verification ===\n');
    await runCommand('node', [join(__dirname, 'verify-without-build.mjs')]);
    
    // Step 3: Run the ESM verification
    // eslint-disable-next-line no-console
    console.log('\n=== Step 3: Running ESM verification ===\n');
    await runCommand('node', [join(__dirname, 'esm-verification.mjs')]);
    
    // eslint-disable-next-line no-console
    console.log('\n✅ All verification steps completed successfully!');
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  }
}

// Run the verification
runVerification(); 