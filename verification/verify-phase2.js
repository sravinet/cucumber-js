/**
 * Verification script for Phase 2 of the Vitest integration
 * 
 * This script verifies that Phase 2 of the Vitest integration is complete by:
 * 1. Checking that the Vitest adapter files exist
 * 2. Checking that the Vitest adapter is exported from the ESM entry point
 * 3. Checking that the enhanced example works
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

// Files that should exist
const requiredFiles = [
  'src/api/vitest.ts',
  'lib/api/vitest.js',
  'lib/api/vitest.d.ts',
  'examples/vitest-enhanced/cucumber.test.js',
  'examples/vitest-enhanced/features/counter.feature',
  'examples/vitest-enhanced/features/step_definitions/counter_steps.js',
  'examples/vitest-enhanced/features/support/world.js',
  'examples/vitest-enhanced/src/counter.js',
  'docs/vitest.md',
  'vitest-integration-phase2-summary.md'
];

// Content that should be present in files
const requiredContent = [
  { file: 'src/api/vitest.ts', content: 'runCucumberInVitest' },
  { file: 'src/api/vitest.ts', content: 'createVitestCucumberTest' },
  { file: 'src/api/vitest.ts', content: 'IVitestRunOptions' },
  { file: 'src/api/vitest.ts', content: 'IVitestRunResult' },
  { file: 'lib/esm.mjs', content: 'createVitestCucumberTest' },
  { file: 'lib/esm.mjs', content: 'runCucumberInVitest' },
  { file: 'src/esm.d.ts', content: 'IVitestOptions' },
  { file: 'src/api/index.ts', content: 'export * from \'./vitest\'' },
  { file: 'docs/vitest.md', content: 'Enhanced Vitest Adapter' },
  { file: 'examples/vitest-enhanced/cucumber.test.js', content: 'createVitestCucumberTest' },
  { file: 'examples/vitest-enhanced/cucumber.test.js', content: 'runCucumberInVitest' },
  { file: 'vitest-integration-phase2-summary.md', content: 'Phase 2 of the Vitest integration plan has been successfully completed' }
];

// Verify that all required files exist
console.log('Verifying required files...');
let allFilesExist = true;
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} does not exist`);
    allFilesExist = false;
  }
}

// Verify that all required content is present
console.log('\nVerifying required content...');
let allContentPresent = true;
for (const { file, content } of requiredContent) {
  if (fs.existsSync(file)) {
    const fileContent = fs.readFileSync(file, 'utf8');
    if (fileContent.includes(content)) {
      console.log(`✅ ${file} contains "${content}"`);
    } else {
      console.log(`❌ ${file} does not contain "${content}"`);
      allContentPresent = false;
    }
  } else {
    console.log(`❌ ${file} does not exist, cannot check for "${content}"`);
    allContentPresent = false;
  }
}

// Verify that the enhanced example works
console.log('\nVerifying that the enhanced example works...');
try {
  console.log('Running tests in examples/vitest-enhanced...');
  execSync('cd examples/vitest-enhanced && npm test', { stdio: 'inherit' });
  console.log('✅ Enhanced example tests passed');
} catch (error) {
  console.log('❌ Enhanced example tests failed');
  process.exit(1);
}

// Final verification
if (allFilesExist && allContentPresent) {
  console.log('\n✅ Phase 2 of the Vitest integration is complete!');
} else {
  console.log('\n❌ Phase 2 of the Vitest integration is not complete. See errors above.');
  process.exit(1);
} 