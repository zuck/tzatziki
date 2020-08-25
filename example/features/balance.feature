Feature: Balance inquiry
  A user wants to know the current balance of her bank account

  Scenario: As user, she wants to know her current balance
    Given a user
    When she queries for her current balance
    Then her up-to-date balance is returned