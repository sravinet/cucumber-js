/**
 * ESM Entry Point Verification Test
 * 
 * This script verifies that the ESM entry point is working correctly.
 * It imports various components from the ESM entry point and checks
 * that they are defined and have the expected properties.
 */

import {
  // Core components
  version,
  supportCodeLibraryBuilder,
  Status,
  DataTable,
  
  // Formatters
  Formatter,
  JsonFormatter,
  
  // Support code functions
  Given,
  When,
  Then,
  Before,
  After,
  
  // World
  World,
  
  // Runtime APIs
  runCucumber
} from '../lib/esm.mjs';

// Verification function
function verify(name, value, type = 'function') {
  if (value === undefined) {
    console.error(`❌ ${name} is not defined`);
    process.exit(1);
  }
  
  if (type === 'function' && typeof value !== 'function') {
    console.error(`❌ ${name} is not a function`);
    process.exit(1);
  }
  
  if (type === 'object' && typeof value !== 'object') {
    console.error(`❌ ${name} is not an object`);
    process.exit(1);
  }
  
  if (type === 'string' && typeof value !== 'string') {
    console.error(`❌ ${name} is not a string`);
    process.exit(1);
  }
  
  console.log(`✅ ${name} is defined and is a ${type}`);
}

// Verify core components
console.log('\n=== Core Components ===');
verify('version', version, 'string');
verify('supportCodeLibraryBuilder', supportCodeLibraryBuilder, 'object');
verify('Status', Status, 'object');
verify('DataTable', DataTable, 'function');

// Verify formatters
console.log('\n=== Formatters ===');
verify('Formatter', Formatter, 'function');
verify('JsonFormatter', JsonFormatter, 'function');

// Verify support code functions
console.log('\n=== Support Code Functions ===');
verify('Given', Given, 'function');
verify('When', When, 'function');
verify('Then', Then, 'function');
verify('Before', Before, 'function');
verify('After', After, 'function');

// Verify World
console.log('\n=== World ===');
verify('World', World, 'function');

// Verify runtime APIs
console.log('\n=== Runtime APIs ===');
verify('runCucumber', runCucumber, 'function');

console.log('\n✅ All verifications passed! The ESM entry point is working correctly.'); 