import { Given, When, Then } from '@cucumber/cucumber-workers';
import app from '../../src/index.js';
import type { Hono } from 'hono';

// Define the World interface for type safety
interface CustomWorld {
  app: Hono;
  env: {
    COUNTER: {
      get: (key: string) => Promise<string | null>;
      put: (key: string, value: string) => Promise<null>;
    }
  };
  response: Response;
}

// Define the response type for type safety
interface CounterResponse {
  id: string;
  count: number;
}

// Mock KV namespace for testing
const mockKV = {
  get: async (key: string): Promise<string | null> => {
    return mockKV.store[key] || null;
  },
  put: async (key: string, value: string): Promise<null> => {
    mockKV.store[key] = value;
    return null;
  },
  store: {} as Record<string, string>
};

// Reset the mock KV store before each scenario
Given('the counter API is available', function(this: CustomWorld) {
  mockKV.store = {};
  this.app = app;
  this.env = { COUNTER: mockKV };
});

Given('the counter {string} has value {int}', async function(this: CustomWorld, id: string, value: number) {
  await mockKV.put(id, value.toString());
});

When('I request the counter with ID {string}', async function(this: CustomWorld, id: string) {
  const request = new Request(`http://localhost/counter/${id}`);
  this.response = await this.app.fetch(request, this.env);
});

When('I increment the counter {string}', async function(this: CustomWorld, id: string) {
  const request = new Request(`http://localhost/counter/${id}/increment`, {
    method: 'POST'
  });
  this.response = await this.app.fetch(request, this.env);
});

When('I reset the counter {string}', async function(this: CustomWorld, id: string) {
  const request = new Request(`http://localhost/counter/${id}/reset`, {
    method: 'POST'
  });
  this.response = await this.app.fetch(request, this.env);
});

Then('I should receive a counter with value {int}', async function(this: CustomWorld, expectedValue: number) {
  const responseBody = await this.response.json() as CounterResponse;
  if (responseBody.count !== expectedValue) {
    throw new Error(`Expected counter value to be ${expectedValue}, but got ${responseBody.count}`);
  }
});

Then('the counter {string} should have value {int}', async function(this: CustomWorld, id: string, expectedValue: number) {
  const request = new Request(`http://localhost/counter/${id}`);
  const response = await this.app.fetch(request, this.env);
  const responseBody = await response.json() as CounterResponse;
  
  if (responseBody.count !== expectedValue) {
    throw new Error(`Expected counter ${id} to have value ${expectedValue}, but got ${responseBody.count}`);
  }
}); 