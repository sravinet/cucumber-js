#!/usr/bin/env node

/**
 * Phase 1 Verification Script (No Build Required)
 * 
 * This script verifies that Phase 1 of the Vitest integration plan is complete
 * without requiring a full build of the project.
 */

import fs from 'node:fs';

// Files that should exist
const requiredFiles = [
  'src/esm.mjs',
  'src/esm.d.ts',
  'src/wrapper.mjs',
  'docs/esm.md',
  'docs/vitest.md',
  'examples/vitest/package.json',
  'examples/vitest/vitest.config.js',
  'examples/vitest/cucumber.feature.js',
  'examples/vitest/features/calculator.feature',
  'examples/vitest/features/step_definitions/calculator_steps.js',
  'examples/vitest/features/support/world.js',
  'examples/vitest-typescript/package.json',
  'examples/vitest-typescript/tsconfig.json',
  'examples/vitest-typescript/vitest.config.ts',
  'examples/vitest-typescript/features/todo.feature',
  'examples/vitest-typescript/src/todo.ts',
  'examples/vitest-typescript/tests/cucumber.test.ts',
  'examples/vitest-typescript/tests/step_definitions/todo_steps.ts',
  'examples/vitest-typescript/tests/support/world.ts',
  'verification/phase1-checklist.md'
];

// Content that should be present in files
const requiredContent = [
  { file: 'src/esm.mjs', content: 'runCucumber' },
  { file: 'src/esm.d.ts', content: 'IVitestOptions' },
  { file: 'src/wrapper.mjs', content: 'IWorld' },
  { file: 'package.json', content: '"./esm": {' },
  { file: 'docs/esm.md', content: 'Enhanced ESM Support' },
  { file: 'docs/vitest.md', content: 'Vitest Integration' },
  { file: 'examples/vitest/cucumber.feature.js', content: '@cucumber/cucumber/esm' },
  { file: 'examples/vitest-typescript/tests/cucumber.test.ts', content: '@cucumber/cucumber/esm' }
];

console.log('=== Phase 1 Verification (No Build Required) ===\n');

// Check if required files exist
console.log('Checking for required files...');
let allFilesExist = true;
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.error(`❌ ${file} does not exist`);
    allFilesExist = false;
  }
}

// Check if required content is present
console.log('\nChecking for required content...');
let allContentPresent = true;
for (const { file, content } of requiredContent) {
  if (fs.existsSync(file)) {
    const fileContent = fs.readFileSync(file, 'utf8');
    if (fileContent.includes(content)) {
      console.log(`✅ ${file} contains "${content}"`);
    } else {
      console.error(`❌ ${file} does not contain "${content}"`);
      allContentPresent = false;
    }
  } else {
    console.error(`❌ ${file} does not exist`);
    allContentPresent = false;
  }
}

// Check if package.json has the correct build script
console.log('\nChecking build script...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (packageJson.scripts['build-local'].includes('shx cp src/esm.mjs lib/')) {
  console.log('✅ build-local script includes copying esm.mjs');
} else {
  console.error('❌ build-local script does not include copying esm.mjs');
  allContentPresent = false;
}

// Final result
console.log('\n=== Verification Result ===');
if (allFilesExist && allContentPresent) {
  console.log('✅ All checks passed! Phase 1 appears to be complete.');
  process.exit(0);
} else {
  console.error('❌ Some checks failed. Phase 1 is not complete.');
  process.exit(1);
} 