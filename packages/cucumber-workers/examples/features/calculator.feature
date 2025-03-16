Feature: Calculator
  In order to avoid silly mistakes
  As a math enthusiast
  I want to be able to perform basic arithmetic operations

  Scenario: Add two numbers
    Given I have entered 50 into the calculator
    And I have entered 70 into the calculator
    When I press add
    Then the result should be 120 on the screen

  Scenario: Subtract two numbers
    Given I have entered 100 into the calculator
    And I have entered 30 into the calculator
    When I press subtract
    Then the result should be 70 on the screen

  Scenario: Multiply two numbers
    Given I have entered 5 into the calculator
    And I have entered 7 into the calculator
    When I press multiply
    Then the result should be 35 on the screen

  Scenario: Divide two numbers
    Given I have entered 84 into the calculator
    And I have entered 7 into the calculator
    When I press divide
    Then the result should be 12 on the screen 