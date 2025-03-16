Feature: Data Tables example
  As a developer
  I want to use data tables in my tests
  So that I can work with tabular data

  Scenario: Working with a list of users
    Given the following users exist:
      | id | name  | email             | active |
      | 1  | John  | john@example.com  | true   |
      | 2  | Jane  | jane@example.com  | true   |
      | 3  | Bob   | bob@example.com   | false  |
    When I filter active users
    Then I should have 2 active users
    And they should be:
      | name | email            |
      | John | john@example.com |
      | Jane | jane@example.com |

  Scenario: Working with key-value pairs
    Given a user with the following attributes:
      | name     | John Smith        |
      | email    | john@example.com  |
      | age      | 30                |
      | location | New York          |
    When I format the user profile
    Then it should contain:
      """
      Name: John Smith
      Email: john@example.com
      Age: 30
      Location: New York
      """

  Scenario: Transposing tables
    Given the following user data:
      | name  | John  | Jane  | Bob   |
      | email | john@ | jane@ | bob@  |
      | age   | 30    | 25    | 45    |
    When I transpose the data
    Then I should have the following user records:
      | name | email | age |
      | John | john@ | 30  |
      | Jane | jane@ | 25  |
      | Bob  | bob@  | 45  | 