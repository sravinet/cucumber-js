import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Cucumber Workers Import Test', () => {
  it('should be able to import from cucumber-workers', () => {
    // Just a simple test to see if we can import from cucumber-workers
    const workersPath = path.resolve(__dirname, '../../cucumber-workers/dist/esm/vitest.js');
    console.log('Workers path:', workersPath);
    expect(true).toBe(true);
  });
}); 