import { Given, When, Then, DataTable } from '../../../src/index.js';

// Define the World interface for type safety
interface ScenarioOutlinesWorld {
  input?: string | number;
  output?: string | number;
  user?: {
    name: string;
    age: number;
    role: string;
  };
  jsonString?: string;
  parsedJson?: Record<string, any>;
}

// Basic scenario outline steps
Given('I have {word} as input', function(this: ScenarioOutlinesWorld, input: string) {
  this.input = isNaN(Number(input)) ? input : Number(input);
  
  // eslint-disable-next-line no-console
  console.log(`Input: ${this.input}`);
});

When('I process it', function(this: ScenarioOutlinesWorld) {
  if (typeof this.input === 'number') {
    this.output = this.input * 2;
  } else {
    this.output = `processed_${this.input}`;
  }
  
  // eslint-disable-next-line no-console
  console.log(`Output: ${this.output}`);
});

Then('I should get {word} as output', function(this: ScenarioOutlinesWorld, expected: string) {
  const expectedValue = isNaN(Number(expected)) ? expected : Number(expected);
  
  if (this.output !== expectedValue) {
    throw new Error(`Expected output to be ${expectedValue} but got ${this.output}`);
  }
});

// Scenario outline with data table steps
Given('I have the following user:', function(this: ScenarioOutlinesWorld, dataTable: DataTable) {
  const userData = dataTable.hashes()[0];
  
  this.user = {
    name: userData.name,
    age: Number(userData.age),
    role: userData.role
  };
  
  // eslint-disable-next-line no-console
  console.log('User:', this.user);
});

When('I check permissions', function(this: ScenarioOutlinesWorld) {
  if (!this.user) {
    throw new Error('No user defined');
  }
  
  // eslint-disable-next-line no-console
  console.log(`Checking permissions for ${this.user.name} with role ${this.user.role}`);
});

Then('the user should have access', function(this: ScenarioOutlinesWorld) {
  if (!this.user) {
    throw new Error('No user defined');
  }
  
  if (this.user.role !== 'admin' && this.user.role !== 'user') {
    throw new Error(`User with role ${this.user.role} should not have access`);
  }
  
  if (this.user.role === 'user' && this.user.age < 18) {
    throw new Error(`User with role ${this.user.role} and age ${this.user.age} should not have access`);
  }
  
  // eslint-disable-next-line no-console
  console.log(`User ${this.user.name} has access`);
});

Then('the user should be denied', function(this: ScenarioOutlinesWorld) {
  if (!this.user) {
    throw new Error('No user defined');
  }
  
  if (this.user.role === 'admin' || (this.user.role === 'user' && this.user.age >= 18)) {
    throw new Error(`User with role ${this.user.role} and age ${this.user.age} should be denied`);
  }
  
  // eslint-disable-next-line no-console
  console.log(`User ${this.user.name} is denied access`);
});

// Scenario outline with doc string steps
Given('I have the following JSON:', function(this: ScenarioOutlinesWorld, docString: string) {
  this.jsonString = docString;
  
  // eslint-disable-next-line no-console
  console.log('JSON string:', this.jsonString);
});

When('I parse the JSON', function(this: ScenarioOutlinesWorld) {
  if (!this.jsonString) {
    throw new Error('No JSON string defined');
  }
  
  try {
    this.parsedJson = JSON.parse(this.jsonString);
    
    // eslint-disable-next-line no-console
    console.log('Parsed JSON:', this.parsedJson);
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error}`);
  }
});

Then('the user should have name {string} and age {int}', function(this: ScenarioOutlinesWorld, name: string, age: number) {
  if (!this.parsedJson) {
    throw new Error('No parsed JSON defined');
  }
  
  if (this.parsedJson.name !== name) {
    throw new Error(`Expected name to be ${name} but got ${this.parsedJson.name}`);
  }
  
  if (this.parsedJson.age !== age) {
    throw new Error(`Expected age to be ${age} but got ${this.parsedJson.age}`);
  }
  
  // eslint-disable-next-line no-console
  console.log(`User has name ${name} and age ${age}`);
}); 