Feature: Hooks example
  As a developer
  I want to use hooks in my tests
  So that I can set up and tear down test state

  @database
  Scenario: Database setup and teardown
    Given I have a database connection
    When I query the database
    Then I should get results

  @api
  Scenario: API authentication
    Given I have an API client
    When I make an authenticated request
    Then I should get a successful response

  @database @api
  Scenario: Database and API integration
    Given I have a database connection and API client
    When I update the database through the API
    Then the database should be updated 