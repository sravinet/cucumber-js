/**
 * Documentation Verification Script
 * 
 * This script verifies that the documentation has been updated
 * to include information about the ESM entry point and Vitest integration.
 */

const fs = require('fs');
const path = require('path');

// Define the expected documentation files and content
const expectedDocs = [
  {
    file: 'docs/esm.md',
    content: [
      'Enhanced ESM Support',
      '@cucumber/cucumber/esm',
      'Vitest Integration'
    ]
  },
  {
    file: 'docs/vitest.md',
    content: [
      'Vitest Integration',
      'Prerequisites',
      'Basic Usage',
      'Advanced Usage',
      'TypeScript Support',
      'Troubleshooting'
    ]
  }
];

// Function to check if a file contains specific content
function checkFileContent(file, contentItems) {
  if (!fs.existsSync(file)) {
    console.error(`❌ File not found: ${file}`);
    return false;
  }
  
  const fileContent = fs.readFileSync(file, 'utf8');
  let allFound = true;
  
  for (const content of contentItems) {
    if (!fileContent.includes(content)) {
      console.error(`❌ Content not found in ${file}: ${content}`);
      allFound = false;
    } else {
      console.log(`✅ Content found in ${file}: ${content}`);
    }
  }
  
  return allFound;
}

// Verify each documentation file
let allPassed = true;

console.log('\n=== Verifying documentation ===');

for (const doc of expectedDocs) {
  console.log(`\n--- Checking ${doc.file} ---`);
  if (!checkFileContent(doc.file, doc.content)) {
    allPassed = false;
  }
}

// Check for references to the examples
console.log('\n--- Checking for example references ---');
const vitestDoc = fs.readFileSync('docs/vitest.md', 'utf8');
if (!vitestDoc.includes('examples/vitest')) {
  console.error('❌ Reference to examples/vitest not found in docs/vitest.md');
  allPassed = false;
} else {
  console.log('✅ Reference to examples/vitest found in docs/vitest.md');
}

if (allPassed) {
  console.log('\n✅ All documentation verifications passed!');
  process.exit(0);
} else {
  console.error('\n❌ Some documentation verifications failed!');
  process.exit(1);
} 