# cmd/slack-texts

Command-line wrapper around `slack-texts`: <https://github.com/nishanths/slack-texts>.

This is *not* available on npm. The `package.json` exists only to help install
dependencies.

## Running

1. Run `npm install`.
1. Edit the .yml files in `config/` if needed.
1. Add a file named .env as described in the Config section below.
1. Run:

  ```
  node slack-texts.js [--team-name TEAM_NAME] [--quiet]
  ```

## Config

Provide API tokens; edit the lists in the config directory.

### 1.  API Tokens

Add a file named `.env` at the root of the app with these contents. Replace the fields with your API tokens.
An example phone number format is: `+15123334444`.

````bash
SLACK_TOKEN=your_slack_token
TWILIO_SID=your_twilio_sid
TWILIO_TOKEN=your_twilio_token
TWILIO_PHONE=your_twilio_phone
````

### 2.  Contacts

The `config/send_to.yml` file is the phone numbers that will receive text notifications. For example:

````yml
- phone: "+15123339999"
- phone: "+16502339999"
- phone: "+18329009000"
````

### 3.  Channels

The `config/channels.yml` file is the list of channel names to listen to for new messages. Leave the file empty
to listen on all channels.

````yml
- "officer-announcements"
- "android"
- "design"
````

### 4.  Keywords

The `config/keywords.yml` file has a list of keywords to look for. Only messages that have at least one of the keywords are used for SMS notifications. Example list:

````yml
- "sms"
- "Apple"
- "important"
````

## License

[MIT](https://github.com/nishanths/slack-texts/blob/master/cmd/slack-texts/LICENSE).
