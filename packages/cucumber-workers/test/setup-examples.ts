/**
 * Setup file for Cucumber Workers examples
 * 
 * This file sets up the environment for running the example tests.
 */

// Mock the Cloudflare Workers environment
// Use type assertions to avoid type errors
(globalThis as any).Response = (globalThis as any).Response || class Response {};
(globalThis as any).Request = (globalThis as any).Request || class Request {};
(globalThis as any).Headers = (globalThis as any).Headers || class Headers {};
(globalThis as any).FetchEvent = (globalThis as any).FetchEvent || class FetchEvent {};

// Set up a mock fetch function if not available
if (!(globalThis as any).fetch) {
  (globalThis as any).fetch = async () => {
    return new (globalThis as any).Response();
  };
}

// Set up console methods if not available
// eslint-disable-next-line no-console
console.log('Setting up Cucumber Workers examples environment');

// Set up process.env if not available
if (typeof process === 'undefined' || !process.env) {
  (globalThis as any).process = {
    env: {},
    stdout: {
      // eslint-disable-next-line no-console
      write: (data: string) => console.log(data)
    },
    stderr: {
      // eslint-disable-next-line no-console
      write: (data: string) => console.error(data)
    }
  };
}

// Set up a mock Miniflare instance
(globalThis as any).Miniflare = {}; 