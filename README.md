# [slack-texts](https://github.com/nishanths/slack-texts) [![NPM version](https://img.shields.io/npm/v/slack-texts.svg)](https://www.npmjs.com/package/slack-texts) [![License shield](https://img.shields.io/npm/l/slack-texts.svg)](https://github.com/nishanths/slack-texts/blob/master/LICENSE)

Receive text messages for conversations on [Slack](http://slack.com)
channels using Twilio.


## Packages

slack-texts is available as an npm package that you can import and run
yourself (see [Quick start](#quick-start)).

Alternatively, you simply use the command-line wrapper directly:
[cmd/slack-texts](https://github.com/nishanths/slack-texts/blob/master/cmd/slack-texts).


### Quick start

Install via npm:

```sh
$ npm install --save slack-texts
```

Import the package and specify keys:

```js
var slack_texts = require('slack-texts');

var keys = {
    slack: {
        token: '<slack-token>'
    },
    twilio: {
        sid:   '<twilio-sid>',
        token: '<twilio-token>',
        phone: '<twilio-phone>'
    }
};

var options = {
    team_name:                'go-team',
    ignore_case_keywords:     true,
    keywords:                 ['economy', 'responsive'],
    channel_names_to_monitor: ['announcements', 'development'],
    send_to_contacts:         [
        { phone: '+10000000000' },
        { phone: '+19999999999' },
        { phone: '+15555555555' }
    ]
};

var st = slack_texts.init(keys, options);
st.start(); // Async call.

// Do other stuff here, if necessary.
```

Run: 

```sh
$ node app.js
``` 

## Features

* Specify phone numbers to send messages to
* Monitor a specific list (or all) channels
* Use only messages that contain specified keywords

## Documentation

#### init()

Initializes and returns a new slack_texts instance. It the same as calling
`new slack_texts(..)`. 

```
var slack_texts = require('slack_texts');
var st = slack_texts.init(keys, options);
```

The two arguments are:

1. keys:

	Twilio and Slack API keys, as shown in the Quick start section. 
	All fields are required.

1. options: 

	Configuration for the `slack_texts` instance.
	The default values are shown below.
	
	```js`
	{
	    // The team name to display in text messages.
	    // Type: string.
	    team_name:                '',
	
	    // Whether to ignore case when filtering messages by keyword.
	    // Type: boolean.
	    ignore_case_keywords:     true,
	
	    // Keywords to filter messages by. If a messages contains any
	    // of the keywords, it will be used for text notifications.
	    // To disable keyword filtering, leave the property undefined
	    // or use an empty array.
	    //
	    // Type: Array<string>.
	    keywords:                 [],
	
	    // The channels to listen to. If a message is sent to these channels,
	    // it will be used for text notifications (subject to other
	    // configuration). To listen to all channels, leave the property
	    // undefined or use an empty array.
	    //
	    // Type: Array<string>.
	    channel_names_to_monitor: [],
	
	    // List of objects, each object containing a phone field (string).
	    // Text messages will be sent to these phones.
	    // 
	    // Type: Array<Object>
	    send_to_contacts:         []
	}
	```

#### start()

Listens for new messages asynchronously, and dispatches text messages
depending on the provided options. The method takes no arguments.

```
var slack_texts = require('slack_texts');
var st = slack_texts.init(keys, options);
st.start();
```


## Contributing

Pull requests are welcome.

1. Fork the repository
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create new Pull Request

You can also create an [issue](https://github.com/nishanths/slack-texts/issues) for new features and bug fixes.

## License

The MIT License. Please see the [LICENSE](https://github.com/nishanths/slack-texts/blob/master/LICENSE) file at the root of this repository.
