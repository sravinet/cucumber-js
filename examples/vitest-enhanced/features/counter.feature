Feature: Counter
  As a user
  I want to increment and decrement a counter
  So that I can keep track of counts

  Scenario: Increment counter
    Given the counter is at 0
    When I increment the counter
    Then the counter should be 1

  Scenario: Decrement counter
    Given the counter is at 5
    When I decrement the counter
    Then the counter should be 4

  Scenario: Reset counter
    Given the counter is at 10
    When I reset the counter
    Then the counter should be 0 