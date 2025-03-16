import { Given, When, Then, DataTable } from '../../../src/index.js';

// Define the World interface for type safety
interface DataTablesWorld {
  users?: Array<{
    id: number;
    name: string;
    email: string;
    active: boolean;
  }>;
  activeUsers?: Array<{
    name: string;
    email: string;
  }>;
  userAttributes?: Record<string, string>;
  formattedProfile?: string;
  userData?: string[][];
  transposedData?: DataTable;
  userRecords?: Record<string, string>[];
}

// Type converters for the user data
const userTypes = {
  id: Number,
  active: (value: string) => value === 'true'
};

Given('the following users exist:', function(this: DataTablesWorld, dataTable: DataTable) {
  // Convert the table to an array of objects with typed values
  this.users = dataTable.typedHashes(userTypes) as Array<{
    id: number;
    name: string;
    email: string;
    active: boolean;
  }>;
  
  // eslint-disable-next-line no-console
  console.log('Users:', this.users);
});

When('I filter active users', function(this: DataTablesWorld) {
  if (!this.users) {
    throw new Error('No users defined');
  }
  
  // Filter active users and select only name and email fields
  this.activeUsers = this.users
    .filter(user => user.active)
    .map(({ name, email }) => ({ name, email }));
  
  // eslint-disable-next-line no-console
  console.log('Active users:', this.activeUsers);
});

Then('I should have {int} active users', function(this: DataTablesWorld, count: number) {
  if (!this.activeUsers) {
    throw new Error('No active users defined');
  }
  
  if (this.activeUsers.length !== count) {
    throw new Error(`Expected ${count} active users but got ${this.activeUsers.length}`);
  }
});

Then('they should be:', function(this: DataTablesWorld, dataTable: DataTable) {
  if (!this.activeUsers) {
    throw new Error('No active users defined');
  }
  
  // Convert the expected data table to an array of objects
  const expectedUsers = dataTable.hashes();
  
  // Check if the active users match the expected users
  if (JSON.stringify(this.activeUsers) !== JSON.stringify(expectedUsers)) {
    throw new Error(
      `Active users do not match expected users.\n` +
      `Expected: ${JSON.stringify(expectedUsers)}\n` +
      `Actual: ${JSON.stringify(this.activeUsers)}`
    );
  }
});

Given('a user with the following attributes:', function(this: DataTablesWorld, dataTable: DataTable) {
  // Convert the table to an object using rowsHash
  this.userAttributes = dataTable.rowsHash();
  
  // eslint-disable-next-line no-console
  console.log('User attributes:', this.userAttributes);
});

When('I format the user profile', function(this: DataTablesWorld) {
  if (!this.userAttributes) {
    throw new Error('No user attributes defined');
  }
  
  // Format the user profile as a string
  this.formattedProfile = Object.entries(this.userAttributes)
    .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
    .join('\n');
  
  // eslint-disable-next-line no-console
  console.log('Formatted profile:', this.formattedProfile);
});

Then('it should contain:', function(this: DataTablesWorld, docString: string) {
  if (!this.formattedProfile) {
    throw new Error('No formatted profile defined');
  }
  
  // Check if the formatted profile matches the expected string
  if (this.formattedProfile !== docString.trim()) {
    throw new Error(
      `Formatted profile does not match expected string.\n` +
      `Expected: ${docString.trim()}\n` +
      `Actual: ${this.formattedProfile}`
    );
  }
});

Given('the following user data:', function(this: DataTablesWorld, dataTable: DataTable) {
  // Store the raw table data
  this.userData = dataTable.raw();
  
  // eslint-disable-next-line no-console
  console.log('User data:', this.userData);
});

When('I transpose the data', function(this: DataTablesWorld) {
  if (!this.userData) {
    throw new Error('No user data defined');
  }
  
  // Create a DataTable from the user data and transpose it
  const table = new DataTable(this.userData);
  this.transposedData = table.transpose();
  
  // eslint-disable-next-line no-console
  console.log('Transposed data:', this.transposedData.raw());
});

Then('I should have the following user records:', function(this: DataTablesWorld, dataTable: DataTable) {
  if (!this.transposedData) {
    throw new Error('No transposed data defined');
  }
  
  // Convert the transposed data to an array of objects
  this.userRecords = this.transposedData.hashes();
  
  // Convert the expected data table to an array of objects
  const expectedRecords = dataTable.hashes();
  
  // Check if the user records match the expected records
  if (JSON.stringify(this.userRecords) !== JSON.stringify(expectedRecords)) {
    throw new Error(
      `User records do not match expected records.\n` +
      `Expected: ${JSON.stringify(expectedRecords)}\n` +
      `Actual: ${JSON.stringify(this.userRecords)}`
    );
  }
}); 