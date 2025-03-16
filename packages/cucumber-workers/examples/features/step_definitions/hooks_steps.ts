import { Given, When, Then, Before, After, BeforeAll, AfterAll } from '../../../src/index.js';

// Define the World interface for type safety
interface HookWorld {
  dbConnection?: {
    isConnected: boolean;
    query: (sql: string) => any;
    update: (data: any) => void;
  };
  apiClient?: {
    isAuthenticated: boolean;
    request: (endpoint: string) => any;
    updateDatabase: (data: any) => void;
  };
  results?: any;
  response?: any;
}

// BeforeAll hook - runs once before all scenarios
BeforeAll(function() {
  // eslint-disable-next-line no-console
  console.log('🚀 Starting test suite');
});

// AfterAll hook - runs once after all scenarios
AfterAll(function() {
  // eslint-disable-next-line no-console
  console.log('✅ Test suite completed');
});

// Before hooks - run before each scenario
Before(function(this: HookWorld) {
  // eslint-disable-next-line no-console
  console.log('⏳ Setting up generic test environment');
  // Generic setup for all scenarios
});

// Tagged Before hooks - run only for scenarios with matching tags
Before({ tags: '@database' }, function(this: HookWorld) {
  // eslint-disable-next-line no-console
  console.log('🗄️ Setting up database connection');
  this.dbConnection = {
    isConnected: true,
    query: (_sql: string) => ({ rows: [{ id: 1, name: 'Test' }] }),
    update: (data: any) => { 
      // eslint-disable-next-line no-console
      console.log('Database updated with', data); 
    }
  };
});

Before({ tags: '@api' }, function(this: HookWorld) {
  // eslint-disable-next-line no-console
  console.log('🔑 Setting up API client');
  this.apiClient = {
    isAuthenticated: true,
    request: (_endpoint: string) => ({ status: 200, data: { success: true } }),
    updateDatabase: (data: any) => { 
      // eslint-disable-next-line no-console
      console.log('API request to update database with', data);
      if (this.dbConnection) {
        this.dbConnection.update(data);
      }
    }
  };
});

// After hooks - run after each scenario
After(function(this: HookWorld) {
  // eslint-disable-next-line no-console
  console.log('🧹 Cleaning up generic test environment');
  // Generic cleanup for all scenarios
});

// Tagged After hooks - run only for scenarios with matching tags
After({ tags: '@database' }, function(this: HookWorld) {
  // eslint-disable-next-line no-console
  console.log('🗄️ Closing database connection');
  if (this.dbConnection) {
    this.dbConnection.isConnected = false;
    this.dbConnection = undefined;
  }
});

After({ tags: '@api' }, function(this: HookWorld) {
  // eslint-disable-next-line no-console
  console.log('🔑 Cleaning up API client');
  if (this.apiClient) {
    this.apiClient.isAuthenticated = false;
    this.apiClient = undefined;
  }
});

// Step definitions
Given('I have a database connection', function(this: HookWorld) {
  if (!this.dbConnection || !this.dbConnection.isConnected) {
    throw new Error('Database connection not set up');
  }
});

Given('I have an API client', function(this: HookWorld) {
  if (!this.apiClient || !this.apiClient.isAuthenticated) {
    throw new Error('API client not set up');
  }
});

Given('I have a database connection and API client', function(this: HookWorld) {
  if (!this.dbConnection || !this.dbConnection.isConnected) {
    throw new Error('Database connection not set up');
  }
  if (!this.apiClient || !this.apiClient.isAuthenticated) {
    throw new Error('API client not set up');
  }
});

When('I query the database', function(this: HookWorld) {
  if (!this.dbConnection) {
    throw new Error('Database connection not available');
  }
  this.results = this.dbConnection.query('SELECT * FROM test');
});

When('I make an authenticated request', function(this: HookWorld) {
  if (!this.apiClient) {
    throw new Error('API client not available');
  }
  this.response = this.apiClient.request('/test');
});

When('I update the database through the API', function(this: HookWorld) {
  if (!this.apiClient) {
    throw new Error('API client not available');
  }
  this.apiClient.updateDatabase({ id: 1, name: 'Updated Test' });
});

Then('I should get results', function(this: HookWorld) {
  if (!this.results || !this.results.rows || this.results.rows.length === 0) {
    throw new Error('No results returned from database');
  }
});

Then('I should get a successful response', function(this: HookWorld) {
  if (!this.response || this.response.status !== 200) {
    throw new Error('API request failed');
  }
});

Then('the database should be updated', function(this: HookWorld) {
  // In a real implementation, we would query the database to verify the update
  // For this example, we'll just check that both the API client and DB connection were used
  if (!this.dbConnection) {
    throw new Error('Database connection not available');
  }
  if (!this.apiClient) {
    throw new Error('API client not available');
  }
}); 