# OUTLOOK LOGIN/EMAIL SENDING TEST

This program was made with Puppeteer and Cucumber. the features folder contains two tests. they log into an outlook account, send an email to a designated address, then check whether the email actually shows up at the sent emails menu, then clears all emails. (one of the feature file only clears the last test email.)

## Usage
```bash
npx cucumber-js features/Outlook_email_sending.feature --import index.js
```
if you want to see the puppeteer window, you can use:
```bash
set SHOW_BROWSER=true
npx cucumber-js features/Outlook_email_sending.feature --import index.js
```
## Made by
Varga Csanád Sándor
