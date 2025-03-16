Feature: Tagged scenarios example
  As a developer
  I want to run specific scenarios based on tags
  So that I can focus on relevant tests

  @smoke
  Scenario: Basic smoke test
    Given I have a smoke test
    When I run it
    Then it should pass

  @regression
  Scenario: Regression test
    Given I have a regression test
    When I run it
    Then it should pass

  @smoke @slow
  Scenario: Slow smoke test
    Given I have a slow smoke test
    When I run it
    Then it should pass

  @e2e
  Scenario: End-to-end test
    Given I have an e2e test
    When I run it
    Then it should pass 