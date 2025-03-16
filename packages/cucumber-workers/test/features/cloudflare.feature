Feature: Cloudflare Workers Integration
  As a developer
  I want to run Cucumber tests in Cloudflare Workers
  So that I can test my Workers applications with BDD

  @cloudflare
  Scenario: Running a simple test in Workers
    Given I am running in a Cloudflare Workers environment
    When I execute a test
    Then it should pass

  @cloudflare @slow
  Scenario: Running a slow test in Workers
    Given I am running in a Cloudflare Workers environment
    When I execute a slow test
    Then it should pass

  Scenario: Running a test with data tables
    Given I have the following data:
      | name  | value |
      | key1  | val1  |
      | key2  | val2  |
    When I process the data
    Then I should get the expected results

  @cloudflare
  Scenario Outline: Parameterized tests in Workers
    Given I have <input> as input
    When I process it in Workers
    Then I should get <output> as output

    Examples:
      | input | output |
      | 1     | 2      |
      | 2     | 4      |
      | 3     | 6      | 