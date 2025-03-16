# Using the Hono Cucumber Demo

This guide provides examples of how to use the Hono Cucumber Demo with Cloudflare Workers and Vitest.

## Running the Application

To run the Hono application locally:

```bash
cd packages/hono-cucumber-demo
npm run dev
```

This will start the application on http://localhost:8787.

## Testing the API Manually

You can test the API endpoints manually using curl:

```bash
# Get the root endpoint
curl http://localhost:8787/

# Get a counter
curl http://localhost:8787/counter/test-counter

# Increment a counter
curl -X POST http://localhost:8787/counter/test-counter/increment

# Reset a counter
curl -X POST http://localhost:8787/counter/test-counter/reset
```

## Running the BDD Tests

To run the BDD tests using Vitest and cucumber-workers:

```bash
cd packages/hono-cucumber-demo
npm test
```

This will execute the Cucumber scenarios defined in `features/counter.feature` using the step definitions in `features/step_definitions/counter.steps.ts`.

## Understanding the Test Output

The test output will show the progress of the Cucumber scenarios:

```
Counter API Tests
  ✓ should run counter scenarios

 PASS  test/counter.test.ts
  Counter API Tests
    ✓ should run counter scenarios

Test Files  1 passed (1)
     Tests  1 passed (1)
      Time  XXXms
```

The detailed Cucumber output will show the results of each scenario:

```
Feature: Counter API
  As an API user
  I want to manage counters
  So that I can track counts for different items

  Background:
    Given the counter API is available

  Scenario: Get a counter that doesn't exist yet
    When I request the counter with ID "test-counter"
    Then I should receive a counter with value 0

  Scenario: Increment a counter
    Given the counter "increment-test" has value 0
    When I increment the counter "increment-test"
    Then the counter "increment-test" should have value 1
    When I increment the counter "increment-test"
    Then the counter "increment-test" should have value 2

  Scenario: Reset a counter
    Given the counter "reset-test" has value 5
    When I reset the counter "reset-test"
    Then the counter "reset-test" should have value 0

3 scenarios (3 passed)
11 steps (11 passed)
```

## Extending the Tests

To add new scenarios, edit the `features/counter.feature` file and add new step definitions in `features/step_definitions/counter.steps.ts` as needed.

## Troubleshooting

If you encounter issues with the tests:

1. Make sure you have the correct dependencies installed
2. Check that the Wrangler configuration is correct
3. Verify that the KV namespace is properly configured
4. Check for TypeScript errors in your code

## Next Steps

- Add more complex scenarios
- Implement authentication
- Add more API endpoints
- Explore other Cucumber features like data tables and scenario outlines 