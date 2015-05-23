# [slack-texts](https://www.npmjs.com/package/slack-texts)

[![NPM version](https://img.shields.io/npm/v/slack-texts.svg)](https://www.npmjs.com/package/slack-texts)
[![Downloads](https://img.shields.io/npm/dm/slack-texts.svg)](https://www.npmjs.com/package/slack-texts)
[![License shield](https://img.shields.io/npm/l/slack-texts.svg)](https://github.com/nishanths/slack-texts/blob/master/LICENSE)

Receive text messages for conversations on [Slack](http://slack.com) channels via Twilio. Available on [npm](https://www.npmjs.com/package/slack-texts).

# Contents
* [Usage](#usage)
* [Features](#features)
* [Documentation](#documentation)
* [Dependencies](#dependencies)
* [Contributing](#contributing)
* [License](#license)

# Usage

Gettin started is really easy. Install slack-texts via npm:

```bash
$ npm install --save slack-texts
```

Use it in your project:

```javascript
// app.js

var slack_texts = require('slack-texts');

// Specify your Slack and Twilio keys
var keys = {
  slack:  { token	: "<SLACK-TOKEN>" },
  twilio: { 
    sid:   "<TWILIO-SID>",
    token: "<TWILIO-TOKEN>",
    phone: "<TWILIO-PHONE>" 
  } 
};

// Configuration
var options = { 
  team_name: 'go-team', 
  ignore_case_keywords: true,
  print_intro: false,
  keywords: [ 'economy', 'responsive' ],
  channel_names_to_monitor: [ 'announcements', 'development' ],
  send_to_contacts: 
   [ { phone: '+10000000000' },
     { phone: '+19999999999' },
     { phone: '+15555555555' } ]
};

// Initialize & start
var st = slack_texts.init(keys, options);
st.start();

```

Run: 

```bash
$ node app.js --harmony
``` 
Since the module uses es6 features, please use the `--harmony` flag to run.


# Features

* Specify phone numbers to send messages to.
* Monitor a specific list (or all) channels
* Allow only messages that contain specific keywords 


# Documentation

The first argument to `slack_texts#init` should contain Twilio and Slack API keys as in the example above. All properties are required.

The second argument to `slack_texts#init` has more interesting properties:

* `team_name` String of the team name to mention in the text messages. (optional, default: "")
* `ignore_case_keywords` Boolean indicating whether to ignore case when filtering messages by keyword. (optional, default: true)
* `print_intro` Boolean indicating whether to print introductory information on start up. (optional, default: false)
* `keywords` Array of Strings of the keywords to filter messages by. If a message contains at least one of the keywords, it will be used for text notifications. If the Array is empty or the property is not specified, *no filtering* occurs. (optional, default: [])
* `channel_names_to_monitor` Array of Strings of the keywords of the channels to listen to. If a new message is sent on these channels, it will be used for text notifications. If the Array is empty or the property is not specified, *all channels* are listened to. (optional, default: [])
* `send_to_contacts` Array of Objects, with each object containing a `phone` property that is a phone number String. Any messages that meet the criteria above are sent as text messages to these phone numbers.


# Dependencies

The following modules are required and are pulled automatically by installing slack-texts:

* ws
* querystring
* twilio
* request

# Contributing

Pull requests are welcome.

1. Fork the repository
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create new Pull Request


You can also create an [issue](https://github.com/nishanths/slack-texts/issues) for new features and bug fixes.


# License

The MIT License. Please see the [LICENSE](https://github.com/nishanths/slack-texts/blob/master/LICENSE) file at the root of this repository.

