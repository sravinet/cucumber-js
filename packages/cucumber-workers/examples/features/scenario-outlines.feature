Feature: Scenario Outlines Example
  As a developer
  I want to use scenario outlines
  So that I can run the same scenario with different data

  Scenario Outline: Basic scenario outline
    Given I have <input> as input
    When I process it
    Then I should get <output> as output

    Examples:
      | input | output |
      | 1     | 2      |
      | 2     | 4      |
      | 3     | 6      |

  Scenario Outline: Scenario outline with data table
    Given I have the following user:
      | name   | age   | role   |
      | <name> | <age> | <role> |
    When I check permissions
    Then the user should <permission>

    Examples:
      | name  | age | role     | permission    |
      | Alice | 30  | admin    | have access   |
      | Bob   | 25  | user     | have access   |
      | Carol | 17  | guest    | be denied     |

  Scenario Outline: Scenario outline with doc string
    Given I have the following JSON:
      """
      {
        "name": "<name>",
        "age": <age>,
        "role": "<role>"
      }
      """
    When I parse the JSON
    Then the user should have name "<name>" and age <age>

    @admin
    Examples:
      | name  | age | role  |
      | Alice | 30  | admin |
      | Dave  | 35  | admin |

    @user
    Examples:
      | name | age | role |
      | Bob  | 25  | user |
      | Eve  | 28  | user | 