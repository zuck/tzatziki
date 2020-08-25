Feature: Google Searching
  As a web surfer, I want to search Google, so that I can learn new things.
  
  Scenario: Simple Google search
    Given a web browser is on the Google page
    When the search phrase "panda" is entered
    And the "Search" button is clicked
    Then results for "panda" are shown
    But the related results do not include "pandemonium"