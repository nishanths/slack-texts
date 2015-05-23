# [slack-texts](https://www.npmjs.com/package/slack-texts)

[![NPM version](https://img.shields.io/npm/v/slack-texts.svg)]((https://www.npmjs.com/package/slack-texts))
[![Downloads](https://img.shields.io/npm/dm/slack-texts.svg)]((https://www.npmjs.com/package/slack-texts))
[![License shield](https://img.shields.io/npm/l/slack-texts.svg)](https://github.com/nishanths/slack-texts/blob/master/LICENSE)

Receive text messages for conversations on Slack channels via Twilio. Available on [npm](https://www.npmjs.com/package/slack-texts).

# Usage

Gettin started is really easy. 

Add slack-texts to your project:

```bash
$ npm install --save slack-texts
```

Use it in your project:

```javascript
// app.js

var slack_texts = require('slack-texts');

// Specify your Slack and Twilio keys
var keys = {
	slack		: { 
		token	: "SLACK-TOKEN" 
	},
	twilio		: {
		sid		: "TWILIO-SID",
		token	: "TWILIO-TOKEN",
		phone	: "TWILIO-PHONE" 
	} 
};

// Configuration
var options = { 
  team_name: 'go-team',
  ignore_case_keywords: true,
  keywords: [ 'economy', 'responsive' ],
  channel_names_to_monitor: [ 'announcements', 'development' ],
  send_to_contacts: 
   [ { phone: '+10000000000' },
     { phone: '+19999999999' },
     { phone: '+15555555555' } ]
};

// Initialize & start
var slack_texts = slack_texts.init(keys, options);
slack_texts.start();

```

Run: 

```bash
$ node app.js --harmony
``` 
**Warning:** Uses es6 features. Use the `--harmony` flag to run.

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

The MIT License. Please see the [LICENSE](https://github.com/nishanths/slack-texts/blob/master/LICENSE) file at the root of the repository.

