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