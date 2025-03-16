Feature: DataTable Usage in Cucumber
  As a developer
  I want to use data tables in my Cucumber tests
  So that I can work with tabular data effectively

  Scenario: Working with a list of products
    Given the following products exist:
      | id | name      | price | in_stock |
      | 1  | Product A | 10.99 | true     |
      | 2  | Product B | 24.99 | true     |
      | 3  | Product C | 5.99  | false    |
    When I filter in-stock products
    Then I should have 2 in-stock products
    And they should be:
      | name      | price |
      | Product A | 10.99 |
      | Product B | 24.99 |

  Scenario: Working with product attributes
    Given a product with the following attributes:
      | name        | Premium Widget    |
      | description | A premium widget  |
      | price       | 49.99             |
      | category    | Electronics       |
    When I format the product details
    Then the formatted details should contain:
      """
      Name: Premium Widget
      Description: A premium widget
      Price: 49.99
      Category: Electronics
      """

  Scenario: Transposing product data
    Given the following product data:
      | name     | Product A | Product B | Product C |
      | price    | 10.99     | 24.99     | 5.99      |
      | in_stock | true      | true      | false     |
    When I transpose the product data
    Then I should have the following product records:
      | name     | price | in_stock |
      | Product A | 10.99 | true     |
      | Product B | 24.99 | true     |
      | Product C | 5.99  | false    | 