Feature: Counter in Cloudflare Workers
  As a developer
  I want to increment and decrement a counter in Cloudflare Workers
  So that I can track state in my application

  Background:
    Given I have a counter initialized to 0

  Scenario: Incrementing the counter
    When I increment the counter
    Then the counter value should be 1

  Scenario: Decrementing the counter
    When I decrement the counter
    Then the counter value should be -1

  Scenario: Multiple operations
    When I increment the counter 3 times
    And I decrement the counter 1 time
    Then the counter value should be 2

  @slow
  Scenario Outline: Performing multiple operations
    When I increment the counter <increment> times
    And I decrement the counter <decrement> times
    Then the counter value should be <result>

    Examples:
      | increment | decrement | result |
      | 5         | 2         | 3      |
      | 10        | 5         | 5      |
      | 3         | 7         | -4     | 