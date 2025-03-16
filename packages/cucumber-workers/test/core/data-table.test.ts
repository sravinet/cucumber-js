import { describe, it, expect } from 'vitest';
import * as messages from '@cucumber/messages';
import { DataTable } from '../../src/core/data-table.js';

describe('DataTable', () => {
  describe('constructor', () => {
    it('should create a DataTable from a string matrix', () => {
      const rawTable = [
        ['name', 'email'],
        ['John', 'john@example.com'],
        ['Jane', 'jane@example.com']
      ];
      const table = new DataTable(rawTable);
      expect(table.raw()).toEqual(rawTable);
    });

    it('should create a DataTable from a PickleTable', () => {
      const pickleTable: messages.PickleTable = {
        rows: [
          {
            cells: [
              { value: 'name' },
              { value: 'email' }
            ]
          },
          {
            cells: [
              { value: 'John' },
              { value: 'john@example.com' }
            ]
          },
          {
            cells: [
              { value: 'Jane' },
              { value: 'jane@example.com' }
            ]
          }
        ]
      };
      const table = new DataTable(pickleTable);
      expect(table.raw()).toEqual([
        ['name', 'email'],
        ['John', 'john@example.com'],
        ['Jane', 'jane@example.com']
      ]);
    });
  });

  describe('raw', () => {
    it('should return a copy of the raw table data', () => {
      const rawTable = [
        ['name', 'email'],
        ['John', 'john@example.com']
      ];
      const table = new DataTable(rawTable);
      const result = table.raw();
      
      // Should be equal but not the same object
      expect(result).toEqual(rawTable);
      expect(result).not.toBe(rawTable);
      
      // Modifying the result should not affect the original
      result[0][0] = 'modified';
      expect(table.raw()[0][0]).toBe('name');
    });
  });

  describe('rows', () => {
    it('should return all rows except the header row', () => {
      const table = new DataTable([
        ['name', 'email'],
        ['John', 'john@example.com'],
        ['Jane', 'jane@example.com']
      ]);
      expect(table.rows()).toEqual([
        ['John', 'john@example.com'],
        ['Jane', 'jane@example.com']
      ]);
    });
  });

  describe('hashes', () => {
    it('should convert the table to an array of objects', () => {
      const table = new DataTable([
        ['name', 'email', 'age'],
        ['John', 'john@example.com', '30'],
        ['Jane', 'jane@example.com', '25']
      ]);
      expect(table.hashes()).toEqual([
        { name: 'John', email: 'john@example.com', age: '30' },
        { name: 'Jane', email: 'jane@example.com', age: '25' }
      ]);
    });
  });

  describe('rowsHash', () => {
    it('should convert a two-column table into an object', () => {
      const table = new DataTable([
        ['name', 'John'],
        ['email', 'john@example.com'],
        ['age', '30']
      ]);
      expect(table.rowsHash()).toEqual({
        name: 'John',
        email: 'john@example.com',
        age: '30'
      });
    });

    it('should throw an error if any row does not have exactly two columns', () => {
      const table = new DataTable([
        ['name', 'John'],
        ['email', 'john@example.com', 'extra'],
        ['age', '30']
      ]);
      expect(() => table.rowsHash()).toThrow(
        'rowsHash can only be called on a data table where all rows have exactly two columns'
      );
    });
  });

  describe('transpose', () => {
    it('should swap rows and columns', () => {
      const table = new DataTable([
        ['name', 'email'],
        ['John', 'john@example.com'],
        ['Jane', 'jane@example.com']
      ]);
      const transposed = table.transpose();
      expect(transposed.raw()).toEqual([
        ['name', 'John', 'Jane'],
        ['email', 'john@example.com', 'jane@example.com']
      ]);
    });
  });

  describe('columns', () => {
    it('should create a new DataTable with only the specified columns', () => {
      const table = new DataTable([
        ['id', 'name', 'email', 'age'],
        ['1', 'John', 'john@example.com', '30'],
        ['2', 'Jane', 'jane@example.com', '25']
      ]);
      const result = table.columns(['id', 'name']);
      expect(result.raw()).toEqual([
        ['id', 'name'],
        ['1', 'John'],
        ['2', 'Jane']
      ]);
    });

    it('should throw an error if any of the specified columns do not exist', () => {
      const table = new DataTable([
        ['id', 'name', 'email'],
        ['1', 'John', 'john@example.com']
      ]);
      expect(() => table.columns(['id', 'nonexistent'])).toThrow(
        'The following columns are missing from the table: nonexistent'
      );
    });
  });

  describe('typedRaw', () => {
    it('should convert values according to the specified types', () => {
      const table = new DataTable([
        ['id', 'name', 'active', 'score'],
        ['1', 'John', 'true', '9.5'],
        ['2', 'Jane', 'false', '8.0']
      ]);
      const result = table.typedRaw({
        id: Number,
        active: (value) => value === 'true',
        score: parseFloat
      });
      expect(result).toEqual([
        [1, 'John', true, 9.5],
        [2, 'Jane', false, 8.0]
      ]);
    });
  });

  describe('typedHashes', () => {
    it('should convert the table to an array of objects with typed values', () => {
      const table = new DataTable([
        ['id', 'name', 'active', 'score'],
        ['1', 'John', 'true', '9.5'],
        ['2', 'Jane', 'false', '8.0']
      ]);
      const result = table.typedHashes({
        id: Number,
        active: (value) => value === 'true',
        score: parseFloat
      });
      expect(result).toEqual([
        { id: 1, name: 'John', active: true, score: 9.5 },
        { id: 2, name: 'Jane', active: false, score: 8.0 }
      ]);
    });
  });
}); 