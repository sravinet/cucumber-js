import { describe, it, expect } from 'vitest';
import { DataTable } from '../../src/core/data-table.js';

describe('DataTable Demo', () => {
  it('demonstrates basic DataTable usage', () => {
    // Create a DataTable from a string matrix
    const table = new DataTable([
      ['id', 'name', 'email', 'active'],
      ['1', 'John', 'john@example.com', 'true'],
      ['2', 'Jane', 'jane@example.com', 'true'],
      ['3', 'Bob', 'bob@example.com', 'false']
    ]);

    // Get the raw table data
    const rawData = table.raw();
    expect(rawData).toEqual([
      ['id', 'name', 'email', 'active'],
      ['1', 'John', 'john@example.com', 'true'],
      ['2', 'Jane', 'jane@example.com', 'true'],
      ['3', 'Bob', 'bob@example.com', 'false']
    ]);

    // Get all rows except the header row
    const rows = table.rows();
    expect(rows).toEqual([
      ['1', 'John', 'john@example.com', 'true'],
      ['2', 'Jane', 'jane@example.com', 'true'],
      ['3', 'Bob', 'bob@example.com', 'false']
    ]);

    // Convert the table to an array of objects
    const hashes = table.hashes();
    expect(hashes).toEqual([
      { id: '1', name: 'John', email: 'john@example.com', active: 'true' },
      { id: '2', name: 'Jane', email: 'jane@example.com', active: 'true' },
      { id: '3', name: 'Bob', email: 'bob@example.com', active: 'false' }
    ]);

    // Convert the table to an array of objects with typed values
    const typedHashes = table.typedHashes({
      id: Number,
      active: (value) => value === 'true'
    });
    expect(typedHashes).toEqual([
      { id: 1, name: 'John', email: 'john@example.com', active: true },
      { id: 2, name: 'Jane', email: 'jane@example.com', active: true },
      { id: 3, name: 'Bob', email: 'bob@example.com', active: false }
    ]);

    // Filter active users
    const activeUsers = typedHashes
      .filter(user => user.active)
      .map(({ name, email }) => ({ name, email }));
    expect(activeUsers).toEqual([
      { name: 'John', email: 'john@example.com' },
      { name: 'Jane', email: 'jane@example.com' }
    ]);
  });

  it('demonstrates rowsHash for key-value pairs', () => {
    // Create a DataTable with key-value pairs
    const table = new DataTable([
      ['name', 'John Smith'],
      ['email', 'john@example.com'],
      ['age', '30'],
      ['location', 'New York']
    ]);

    // Convert the table to an object
    const attributes = table.rowsHash();
    expect(attributes).toEqual({
      name: 'John Smith',
      email: 'john@example.com',
      age: '30',
      location: 'New York'
    });

    // Format the user profile
    const formattedProfile = Object.entries(attributes)
      .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
      .join('\n');
    expect(formattedProfile).toBe(
      'Name: John Smith\n' +
      'Email: john@example.com\n' +
      'Age: 30\n' +
      'Location: New York'
    );
  });

  it('demonstrates table transposition', () => {
    // Create a DataTable with user data
    const table = new DataTable([
      ['name', 'John', 'Jane', 'Bob'],
      ['email', 'john@', 'jane@', 'bob@'],
      ['age', '30', '25', '45']
    ]);

    // Transpose the table
    const transposed = table.transpose();
    expect(transposed.raw()).toEqual([
      ['name', 'email', 'age'],
      ['John', 'john@', '30'],
      ['Jane', 'jane@', '25'],
      ['Bob', 'bob@', '45']
    ]);

    // Convert the transposed table to an array of objects
    const userRecords = transposed.hashes();
    expect(userRecords).toEqual([
      { name: 'John', email: 'john@', age: '30' },
      { name: 'Jane', email: 'jane@', age: '25' },
      { name: 'Bob', email: 'bob@', age: '45' }
    ]);
  });

  it('demonstrates columns selection', () => {
    // Create a DataTable with user data
    const table = new DataTable([
      ['id', 'name', 'email', 'age', 'active'],
      ['1', 'John', 'john@example.com', '30', 'true'],
      ['2', 'Jane', 'jane@example.com', '25', 'true'],
      ['3', 'Bob', 'bob@example.com', '45', 'false']
    ]);

    // Select only specific columns
    const nameEmailTable = table.columns(['name', 'email']);
    expect(nameEmailTable.raw()).toEqual([
      ['name', 'email'],
      ['John', 'john@example.com'],
      ['Jane', 'jane@example.com'],
      ['Bob', 'bob@example.com']
    ]);

    // Convert to hashes
    const nameEmailHashes = nameEmailTable.hashes();
    expect(nameEmailHashes).toEqual([
      { name: 'John', email: 'john@example.com' },
      { name: 'Jane', email: 'jane@example.com' },
      { name: 'Bob', email: 'bob@example.com' }
    ]);
  });

  it('demonstrates typedRaw for type conversion', () => {
    // Create a DataTable with user data
    const table = new DataTable([
      ['id', 'name', 'score', 'active'],
      ['1', 'John', '9.5', 'true'],
      ['2', 'Jane', '8.0', 'true'],
      ['3', 'Bob', '7.2', 'false']
    ]);

    // Convert values according to specified types
    const typedRows = table.typedRaw({
      id: Number,
      score: parseFloat,
      active: (value) => value === 'true'
    });
    expect(typedRows).toEqual([
      [1, 'John', 9.5, true],
      [2, 'Jane', 8.0, true],
      [3, 'Bob', 7.2, false]
    ]);

    // Calculate average score of active users
    const activeScores = typedRows
      .filter(row => row[3] === true)
      .map(row => row[2]);
    const averageScore = activeScores.reduce((sum, score) => sum + score, 0) / activeScores.length;
    expect(averageScore).toBe(8.75);
  });
}); 