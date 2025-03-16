import * as messages from '@cucumber/messages';

/**
 * DataTable class for handling tabular data in Cucumber steps
 * 
 * This is based on the original Cucumber.js DataTable implementation
 * but adapted for the Workers environment.
 */
export class DataTable {
  private readonly rawTable: string[][];

  /**
   * Create a new DataTable
   * 
   * @param sourceTable - Source table data, either a PickleTable from Gherkin or a string matrix
   */
  constructor(sourceTable: messages.PickleTable | string[][]) {
    if (sourceTable instanceof Array) {
      this.rawTable = sourceTable;
    } else {
      this.rawTable = sourceTable.rows.map((row) =>
        row.cells.map((cell) => cell.value)
      );
    }
  }

  /**
   * Convert the table to an array of objects
   * 
   * The first row of the table is used as property names.
   * 
   * @returns Array of objects with properties from the header row
   * @example
   * ```
   * | name  | email          |
   * | John  | john@example.com |
   * | Jane  | jane@example.com |
   * ```
   * becomes:
   * ```
   * [
   *   { name: 'John', email: 'john@example.com' },
   *   { name: 'Jane', email: 'jane@example.com' }
   * ]
   * ```
   */
  hashes(): Record<string, string>[] {
    const copy = this.raw();
    const keys = copy[0];
    const valuesArray = copy.slice(1);
    return valuesArray.map((values) => {
      const rowObject: Record<string, string> = {};
      keys.forEach((key, index) => (rowObject[key] = values[index]));
      return rowObject;
    });
  }

  /**
   * Get a copy of the raw table data
   * 
   * @returns Deep copy of the raw table data as a string matrix
   */
  raw(): string[][] {
    // Create a deep copy of the raw table
    return this.rawTable.map(row => [...row]);
  }

  /**
   * Get all rows except the header row
   * 
   * @returns All rows except the header row
   */
  rows(): string[][] {
    const copy = this.raw();
    copy.shift();
    return copy;
  }

  /**
   * Convert a two-column table into an object
   * 
   * The first column is used as keys, the second column as values.
   * 
   * @returns Object with keys from the first column and values from the second column
   * @throws Error if any row doesn't have exactly two columns
   * @example
   * ```
   * | name  | John  |
   * | email | john@example.com |
   * ```
   * becomes:
   * ```
   * {
   *   name: 'John',
   *   email: 'john@example.com'
   * }
   * ```
   */
  rowsHash(): Record<string, string> {
    const rows = this.raw();
    const everyRowHasTwoColumns = rows.every((row) => row.length === 2);
    if (!everyRowHasTwoColumns) {
      throw new Error(
        'rowsHash can only be called on a data table where all rows have exactly two columns'
      );
    }
    const result: Record<string, string> = {};
    rows.forEach((x) => (result[x[0]] = x[1]));
    return result;
  }

  /**
   * Transpose the table (swap rows and columns)
   * 
   * @returns A new DataTable with rows and columns swapped
   * @example
   * ```
   * | name  | email          |
   * | John  | john@example.com |
   * | Jane  | jane@example.com |
   * ```
   * becomes:
   * ```
   * | name | John | Jane |
   * | email | john@example.com | jane@example.com |
   * ```
   */
  transpose(): DataTable {
    const transposed = this.rawTable[0].map((x, i) =>
      this.rawTable.map((y) => y[i])
    );
    return new DataTable(transposed);
  }

  /**
   * Create a new DataTable with only the specified columns
   * 
   * @param columns - Column names to include
   * @returns A new DataTable with only the specified columns
   * @throws Error if any of the specified columns don't exist
   */
  columns(columns: string[]): DataTable {
    const copy = this.raw();
    const header = copy[0];
    
    // Check if all specified columns exist
    const missingColumns = columns.filter(col => !header.includes(col));
    if (missingColumns.length > 0) {
      throw new Error(`The following columns are missing from the table: ${missingColumns.join(', ')}`);
    }
    
    // Get indices of columns to keep
    const indices = columns.map(col => header.indexOf(col));
    
    // Create new table with only the specified columns
    const newTable = copy.map(row => indices.map(i => row[i]));
    
    return new DataTable(newTable);
  }

  /**
   * Convert the table to an array of arrays with typed values
   * 
   * @param types - Object mapping column names to type conversion functions
   * @returns Array of arrays with typed values
   * @example
   * ```
   * | id  | name  | active |
   * | 1   | John  | true   |
   * | 2   | Jane  | false  |
   * ```
   * with types:
   * ```
   * {
   *   id: Number,
   *   active: Boolean
   * }
   * ```
   * becomes:
   * ```
   * [
   *   [1, 'John', true],
   *   [2, 'Jane', false]
   * ]
   * ```
   */
  typedRaw(types: Record<string, (value: string) => any> = {}): any[][] {
    const copy = this.raw();
    const header = copy[0];
    const rows = copy.slice(1);
    
    return rows.map(row => {
      return row.map((cell, i) => {
        const columnName = header[i];
        const typeConverter = types[columnName];
        return typeConverter ? typeConverter(cell) : cell;
      });
    });
  }

  /**
   * Convert the table to an array of objects with typed values
   * 
   * @param types - Object mapping column names to type conversion functions
   * @returns Array of objects with typed values
   * @example
   * ```
   * | id  | name  | active |
   * | 1   | John  | true   |
   * | 2   | Jane  | false  |
   * ```
   * with types:
   * ```
   * {
   *   id: Number,
   *   active: Boolean
   * }
   * ```
   * becomes:
   * ```
   * [
   *   { id: 1, name: 'John', active: true },
   *   { id: 2, name: 'Jane', active: false }
   * ]
   * ```
   */
  typedHashes(types: Record<string, (value: string) => any> = {}): Record<string, any>[] {
    const copy = this.raw();
    const keys = copy[0];
    const valuesArray = copy.slice(1);
    
    return valuesArray.map(values => {
      const rowObject: Record<string, any> = {};
      keys.forEach((key, index) => {
        const value = values[index];
        const typeConverter = types[key];
        rowObject[key] = typeConverter ? typeConverter(value) : value;
      });
      return rowObject;
    });
  }
} 