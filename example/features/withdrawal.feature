Feature: withdrawal
  A user wants to whitdraw money from her bank account

  Scenario: Credit is greater or equal than requested amount
    Given a user
    Given requesting an available <amount>
    When she withdraws
    Then her credit is decreased by the withdrawn <amount>
    And her up-to-date balance is returned

  Scenario: Credit is lesser than requested amount
    Given a user
    Given requesting an unavailable <amount>
    When she withdraws
    Then her credit is not touched
    And an error is returned