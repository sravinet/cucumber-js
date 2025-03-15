/**
 * Examples Verification Script
 * 
 * This script verifies that the example projects are correctly set up.
 * It checks for the presence of required files and their contents.
 */

const fs = require('fs');
const path = require('path');

// Define the expected files for each example
const expectedFiles = {
  'vitest': [
    'package.json',
    'vitest.config.js',
    'cucumber.feature.js',
    'features/calculator.feature',
    'features/step_definitions/calculator_steps.js',
    'features/support/world.js'
  ],
  'vitest-typescript': [
    'package.json',
    'tsconfig.json',
    'vitest.config.ts',
    'features/todo.feature',
    'src/todo.ts',
    'tests/cucumber.test.ts',
    'tests/step_definitions/todo_steps.ts',
    'tests/support/world.ts'
  ]
};

// Function to check if a file exists
function checkFileExists(exampleDir, file) {
  const filePath = path.join('examples', exampleDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return false;
  }
  console.log(`✅ File exists: ${filePath}`);
  return true;
}

// Function to check if a file contains specific content
function checkFileContent(exampleDir, file, content) {
  const filePath = path.join('examples', exampleDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return false;
  }
  
  const fileContent = fs.readFileSync(filePath, 'utf8');
  if (!fileContent.includes(content)) {
    console.error(`❌ Content not found in ${filePath}: ${content}`);
    return false;
  }
  
  console.log(`✅ Content found in ${filePath}: ${content}`);
  return true;
}

// Verify each example
let allPassed = true;

for (const [exampleDir, files] of Object.entries(expectedFiles)) {
  console.log(`\n=== Verifying ${exampleDir} example ===`);
  
  // Check if all expected files exist
  for (const file of files) {
    if (!checkFileExists(exampleDir, file)) {
      allPassed = false;
    }
  }
  
  // Check for specific content in key files
  if (exampleDir === 'vitest') {
    if (!checkFileContent(exampleDir, 'cucumber.feature.js', '@cucumber/cucumber/esm')) {
      allPassed = false;
    }
    if (!checkFileContent(exampleDir, 'features/step_definitions/calculator_steps.js', '@cucumber/cucumber/esm')) {
      allPassed = false;
    }
  } else if (exampleDir === 'vitest-typescript') {
    if (!checkFileContent(exampleDir, 'tests/cucumber.test.ts', '@cucumber/cucumber/esm')) {
      allPassed = false;
    }
    if (!checkFileContent(exampleDir, 'tests/step_definitions/todo_steps.ts', '@cucumber/cucumber/esm')) {
      allPassed = false;
    }
  }
}

if (allPassed) {
  console.log('\n✅ All example verifications passed!');
  process.exit(0);
} else {
  console.error('\n❌ Some example verifications failed!');
  process.exit(1);
} 