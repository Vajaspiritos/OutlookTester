Feature: Email sending

  Scenario: Log in, send an email, verify it appears in Sent, and clean up
    Given I am logged in as "gugla9@outlook.hu" with password "NotASafePassword"
    When I send an email to "gugla9@gmail.com"
    Then the email should appear in my Sent folder
    Then I clear the sent emails
