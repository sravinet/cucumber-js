Feature: Todo List
  In order to remember things I need to do
  As a busy person
  I want to manage my todo list

  Scenario: Add a task
    Given I have an empty todo list
    When I add "Buy milk" to my todo list
    Then my todo list should contain "Buy milk"

  Scenario: Complete a task
    Given I have a todo list with the following tasks:
      | task         | completed |
      | Buy milk     | false     |
      | Walk the dog | false     |
    When I mark "Buy milk" as completed
    Then the task "Buy milk" should be completed
    And the task "Walk the dog" should not be completed

  Scenario: Remove a task
    Given I have a todo list with the following tasks:
      | task         | completed |
      | Buy milk     | false     |
      | Walk the dog | false     |
    When I remove "Buy milk" from my todo list
    Then my todo list should not contain "Buy milk"
    And my todo list should contain "Walk the dog" 