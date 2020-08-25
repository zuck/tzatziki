Feature: deposit
  A user wants to deposit money on her bank account

  Scenario: Deposit money
    Given a user
    When she deposits a specific <amount>
    Then her credit is increased by the deposited <amount>
    And her up-to-date balance is returned