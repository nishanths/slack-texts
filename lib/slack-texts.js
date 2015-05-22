const
	twilio = require('twilio'),
	real_time_messaging = require('./slack-utils/real-time-messaging.js'),
	web_api = require('./slack-utils/web-api'),

	/**
	 * Sets up slack_texts
	 * @param  {Object} keys                      Twilio and Slack tokens
	 * @param  {Array}  channel_names_to_monitor  The channels to receive texts for
	 * @param  {Array}  send_to_contacts          The contacts to send messages to
	 * @param  {String} team_name                 The name of the Slack team to include in messages
	 * @return {Object}                           this
	 */
	slack_texts = function (keys, channel_names_to_monitor, send_to_contacts, team_name) {
		var self = this;

		this.channel_names_to_monitor = channel_names_to_monitor;
		this.channel_names_set = new Set(channel_names_to_monitor);
		this.channels_map = new Map();
		this.users_map = new Map();
		this.team_name = team_name;

		this.keys = keys;
		this.send_to_contacts = send_to_contacts;

		if (!this.check_keys()) {
			throw new Error("A required keys is empty. Please make sure your API keys are filled in correctly. See the README file at https://github.com/nishanths/slack-texts for details.");
		}

		this.twilio_client = twilio(this.keys.twilio.sid, this.keys.twilio.token);

		return this;
	};

/**
 * Gets data from Slack and starts the text messaging service
 */
slack_texts.prototype.start = function() {
	this.print_intro();

	this.create_channels_map()
		.then(this.create_users_map())
		.then(this.listen_for_real_time_events());
};

/**
 * Prints the intro text to the console on starting to listen
 */
slack_texts.prototype.print_intro = function () {
	var channels = this.channel_names_to_monitor.reduce(function (existing, channel) {
		return existing + " " + channel;
	});

	var pluralized_phone_numbers = this.send_to_contacts.length === 1 ? "phone number" : "phone numbers";

	console.log("Starting slack-texts ...");
	console.log("New messages will be sent to " + this.send_to_contacts.length + " " + pluralized_phone_numbers + " ...");
	console.log("Listening to these channels for new messages:", channels);
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

		else if (event_info.type == "message" && self.channels_map.has(event_info.channel)) {
			if (event_info.subtype == undefined) {
				// no subtype
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

			var username = user_info.name;
			var channel_name = self.channels_map.get(channel_id);

			var ret = "#" + channel_name + " " + "(" + self.team_name +  ") @" + username + ": " + message;
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
		body: JSON.stringify(str)
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
 * The default public initializer. See the README for more details on parameter requirements.
 * @param  {Object} keys                      Twilio and Slack tokens
 * @param  {Array}  channel_names_to_monitor  The channels to receive texts for
 * @param  {Array}  send_to_contacts          The contacts to send messages to
 * @param  {String} team_name                 The name of the Slack team to include in messages
 * @return {Object}                           this
 */
module.exports.init = function (keys, channel_names_to_monitor, send_to_contacts, team_name) {
	return new slack_texts(keys, channel_names_to_monitor, send_to_contacts, team_name);
};
