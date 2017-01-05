require('dotenv').load();
const slack_texts = require('slack-texts');
const YAML = require('yamljs');

var print_intro = function(options) {
    console.log("*** cmd/slack-texts ***");

    if (options.send_to_contacts.length !== 0) {
        console.log("Will send text messages to these phone numbers (" + options.send_to_contacts.length + "):");
        options.send_to_contacts.forEach(function(n) {
            console.log(" " + n.phone);
        });
    } else {
        console.log("No phone numbers specified.");
    }

    if (options.keywords.length !== 0) {
        console.log("Filtering messages by these keywords (" + options.keywords.length + "):");
        options.keywords.forEach(function(n) {
            console.log(" " + n);
        });
    } else {
        console.log("Keyword filtering is disabled.")
    }


    if (options.ignore_case_keywords) {
        console.log("Keywords are not case-sensitive.")
    } else {
        console.log("Keywords are case-sensitive.")
    }

    if (options.channel_names_to_monitor.length !== 0) {
        console.log("Listening for new messages on these channels (" + options.channel_names_to_monitor.length + "):");
        options.channel_names_to_monitor.forEach(function(n) {
            console.log(" " + n);
        });
    } else {
        console.log("Listening for new messages on all channels.");
    }
};

var keys = {
    twilio: {
        sid: process.env.TWILIO_SID,
        token: process.env.TWILIO_TOKEN,
        phone: process.env.TWILIO_PHONE
    },
    slack: {
        token: process.env.SLACK_TOKEN
    }
};

var team_name = '';
var idx = process.argv.indexOf('--team-name');
if (idx !== -1 && process.argv.length > idx+1) {
    team_name = process.argv[idx+1];
}

var options = {
    team_name:                  team_name,
    keywords:                   YAML.load('./config/keywords.yml') || [],
    send_to_contacts:           YAML.load('./config/send_to.yml') || [],
    channel_names_to_monitor:   YAML.load('./config/channels.yml') || []
};

var quiet = process.argv.indexOf('--quiet') !== -1;
if (!quiet) {
    print_intro(options);
}

var st = slack_texts.init(keys, options);
st.start();
