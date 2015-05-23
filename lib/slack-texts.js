const
    twilio = require('twilio'),
    real_time_messaging = require('./slack-utils/real-time-messaging.js'),
    web_api = require('./slack-utils/web-api'),

    /**
     * Sets up slack_texts
     * @param  {Object} keys                      Twilio and Slack tokens
     * @param  {Object} option                    Options to filter messages by, contacts, team name, more
     * @return {Object}                           this
     */
    slack_texts = function (keys, options) {
        var self = this;

        // Keys
        this.keys = keys;

        // Contacts
        if (options.send_to_contacts != null || options.send_to_contacts.length !== 0) {
            this.send_to_contacts = options.send_to_contacts;
        } else {
            this.send_to_contacts = [];
        }

        // Channels
        if (options.channel_names_to_monitor != null || options.channel_names_to_monitor.length !== 0) {
            this.channel_names_to_monitor = options.channel_names_to_monitor;
        } else {
            this.channel_names_to_monitor = [];
        }

        this.channel_names_set = new Set(this.channel_names_to_monitor);
        this.channels_map = new Map();

        // Team name
        if (options.team_name != null && !isEmpty(options.team_name)) {
            this.team_name = options.team_name;
        } else {
            this.team_name = "";
        }

        // Print introductory block
        if (options.print_intro != null) {
            this.print_intro = true;
        } else {
            this.print_intro = false;
        }

        // Ignore case
        if (options.ignore_case_keywords != null) {
            this.ignore_case_keywords = options.ignore_case_keywords;
        } else {
            this.ignore_case_keywords = true;
        }

        // Keywords
        if (options.keywords != null && options.keywords.length !== 0) {
            if (this.ignore_case_keywords) {
                this.keywords = options.keywords.map(function (word) {
                    return word.toLowerCase();
                });
            } else {
                this.keywords = options.keywords;
            }
        } else {
            this.keywords = [];
        }

        this.users_map = new Map();

        if (!this.check_keys()) {
            throw new Error("A required key is empty.\nPlease make sure your API keys are filled in correctly.\nSee the README file at https://github.com/nishanths/slack-texts for details.");
        }

        this.twilio_client = twilio(this.keys.twilio.sid, this.keys.twilio.token);

        return this;
    };

/**
 * Gets data from Slack and starts the text messaging service
 */
slack_texts.prototype.start = function() {
    if (this.print_intro) {
        this.print_introductory_text();
    }

    this.create_channels_map()
        .then(this.create_users_map())
        .then(this.listen_for_real_time_events());
};

/**
 * Prints introductory text to the console based on the options on starting to listen
 */
slack_texts.prototype.print_introductory_text = function () {
    var pluralized_phone_numbers = this.send_to_contacts.length === 1 ? "phone number" : "phone numbers";
    var pluralized_channels = this.channel_names_to_monitor.length === 1 ? "channel" : "channels";
    var pluralized_keywords = this.keywords.length === 1 ? "keyword" : "keywords";


    console.log("Starting slack-texts ...");

    console.log("New messages will be sent to the " + this.send_to_contacts.length + " " + pluralized_phone_numbers + " below:");
    console.log(this.send_to_contacts);
    
    if (this.channel_names_to_monitor.length !== 0) {
        console.log("Listening to these " + this.channel_names_to_monitor.length + " " + pluralized_channels + " for new messages:", this.channel_names_to_monitor);
    } else {
        console.log("Listening to all channels for new messages:");
    }

    var ignoring_case;
    if (this.ignore_case_keywords) {
        ignoring_case = " (ignoring case)";
    } else {
        ignoring_case = "";
    }

    if (this.keywords.length !== 0) {
        console.log("Filtering by these " + this.keywords.length + " " + pluralized_keywords + ignoring_case + ":", this.keywords);
    }
};

/**
 * Checks the existence of required API keys (not completely implemented)
 * @return {Boolean} true if keys exists; false otherwise
 */
slack_texts.prototype.check_keys = function () {
    if (isEmpty(this.keys.twilio.phone)) return false;
    if (isEmpty(this.keys.slack.token)) return false;

    return true;
};

/**
 * Listens and handles for new message events
 */
slack_texts.prototype.listen_for_real_time_events = function() {
    var self = this;

    var rtm = real_time_messaging.init({ token: this.keys.slack.token }, function (event_info) {
        if (event_info.ok === false) {
            console.log("Error:", event_info);
        }

        else if (event_info.type == "message" && event_info.subtype == null) { // only new messages
            if (self.filter(event_info)) {
                var message = event_info.text;
                var sender_id = event_info.user;
                var channel_id = event_info.channel;

                self.pretty_string(message, sender_id, channel_id)
                    .then(function (str) {
                        self.send_all(str);
                    });
            }
        }
    });

    rtm.listen();
};

/**
 * Returns true if the `event_info` passes all the filters
 * @param  {Object} event_info  The event_info from Slack
 * @return {Boolean}            true if all filters pass; false otherwise
 */
slack_texts.prototype.filter = function (event_info) {
    var self = this;

    var filters = {
        channel: self.channel_names_set.length === 0 || self.channels_map.has(event_info.channel),
        keywords: self.keywords.length === 0 || self.message_contains_keywords(event_info.text)
    };

    var bool = true;

    Object.keys(filters).forEach(function(key) {
        bool = bool && filters[key];
    });

    return bool;
};

/**
 * Returns true if the message contains any of the keywords
 * @param  {String} message  The message 
 * @return {Boolean}         true if the message contains any of the keywords, false otherwise
 */
slack_texts.prototype.message_contains_keywords = function (message) {
    var i;

    if (this.ignore_case_keywords) {
        message = message.toLowerCase();
    }
    
    for (i = 0; i < this.keywords.length; i++) {
        if (message.indexOf(this.keywords[i]) !== -1) {
            return true;
        }
    }

    return false;
};

/**
 * Creates a pretty string
 * @param  {String} message    Message sent on the channel
 * @param  {String} sender_id  Slack user ID of sender (not username)
 * @param  {String} channel_id Slack channel ID (not channel name)
 */
slack_texts.prototype.pretty_string = function (message, sender_id, channel_id) {
    var self = this;

    return new Promise(function(fulfill, reject) {
        self.get_user_info(sender_id).then(function (user_info) {
            if (user_info.ok === false) {
                console.log("Error:", user_info);
            }

            var username = "@" + user_info.name;
            var channel = "#" + self.channels_map.get(channel_id);
            var team; // optional

            if (!isEmpty(self.team_name)) {
                team = "(" + self.team_name +  ") ";
            } else {
                team = "";
            }

            var ret = channel + " " + team + username + ": " + message;
            fulfill(ret);
        });
    });
};

/**
 * Gets the user's username and real name for a Slack ID
 * @param  {String} user_id The user's Slack ID
 */
slack_texts.prototype.get_user_info = function (user_id) {
    var self = this;

    return new Promise(function (fulfill, reject) {
        var user_info = self.users_map.get(user_id);
        
        if (user_info !== undefined) {
            fulfill(user_info);
        }

        // may be a new user, so get again
        var uinfo = web_api.init("users.info", { token: self.keys.slack.token, user: user_id }, function (info) {
            self.users_map.set(info.id, { real_name: info.real_name, name: info.name });
            user_info = self.users_map.get(user_id);
            fulfill(user_info);
        });
        
        uinfo.call();
    });
};

/**
 * Maps Slack channel IDs -> Channel names
 */
slack_texts.prototype.create_channels_map = function () {
    var self = this;

    return new Promise(function (fulfill, reject) {
        var clist = web_api.init("channels.list", { token: self.keys.slack.token }, function (list) {
            
            if (list.ok === false) {
                console.log("Error:", list);
            }

            list.channels.forEach(function (info) {
                if (self.channel_names_set.has(info.name)) {
                    self.channels_map.set(info.id, info.name);
                }
            });

            fulfill();
        });

        clist.call();
    });
};

/**
 * Maps Slack user IDs -> { real name, username } objects
 */
slack_texts.prototype.create_users_map = function () {
    var self = this;

    return new Promise(function (fulfill, reject) {
        var ulist = web_api.init("users.list", { token: self.keys.slack.token }, function (list) {
            
            if (list.ok === false) {
                console.log("Error:", list);
            }
            
            list.members.forEach(function (info) {
                self.users_map.set(info.id, { real_name: info.profile.real_name, name: info.name });
            });

            fulfill();
        });

        ulist.call();
    });
};

/**
 * Send `str` to `contact`'s phone using Twilio
 * @param  {Object} contact The contact to send the message to
 * @param  {String} str     The message contents
 */
slack_texts.prototype.send = function (contact, str) {
    var self = this;
    var to_number = contact.phone;

    self.twilio_client.sendMessage({
        to: to_number,
        from: self.keys.twilio.phone,
        body: str
    }, function(err, res) {
        if (err) {
            console.log("Error:", err);
        }
    });
};

/**
 * Sends `str` to all contacts. Calls `send`.
 * @param  {String} str The message contents
 */
slack_texts.prototype.send_all = function (str) {
    var self = this;

    this.send_to_contacts.forEach(function (contact) {
        self.send(contact, str);
    });
};

/**
 * Checks for null or empty string
 * @param  {String}  str The string to check
 * @return {Boolean}     true if the string is non-null and has a non-zero length; false otherwise
 */
function isEmpty(str) {
    return (!str || 0 === str.length);
}

/**
 * Sets up slack_texts
 * @param  {Object} keys                      Twilio and Slack tokens
 * @param  {Object} option                    Options to filter messages by, contacts, team name, more
 * @return {Object}                           this
 */
module.exports.init = function (keys, options) {
    return new slack_texts(keys, options);
};
