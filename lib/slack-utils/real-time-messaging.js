const
	request = require('request'),
	ws = require('ws'),
	querystring = require('querystring'),
	rtm_base_url = 'https://slack.com/api/rtm.start',

	/**
	 * Creates a real-time-messaging client for Slack
	 * @param  {Object}   params   The parameters required such as the token
	 * @param  {Function} callback Callback that receives real time messaging events
	 * @return {Object}            this
	 */
	real_time_messaging = function (params, callback) {
		this.params = params;
		this.callback = callback;

		return this;
	};

/**
 * Begin listening
 */
real_time_messaging.prototype.listen = function () {
	var self = this;

	self.handshake(function (data) {
		if (data.ok) {
			self.ws = new ws(data.url);
			self.ws.on('message', function (data) {
				var event_info = JSON.parse(data);
				self.handle(event_info);
			});
		} else {
			// handshake failed
			console.log(data);
			throw new Error("The initial setup failed. Exiting. Please make sure your Slack API key is correct.");
		}
	});
};

/**
 * Establish the initial condition and obtain the url
 * @param  {Function} fn Callback that receives the initial handshake data
 */
real_time_messaging.prototype.handshake = function (fn) {
	request(this.encoded_url(), function (err, res, body) {
		var data;
		
		if (!err && res.statusCode == 200) {
			data = JSON.parse(body);
		} else {
			data = { ok: false };
		}

		return fn(data);
	});
};

/**
 * Encodes the URL for the request
 * @return {String} Encoded URL
 */
real_time_messaging.prototype.encoded_url = function () {
	return rtm_base_url + '?' + querystring.stringify(this.params);
};

/**
 * Handles parsed information
 * @param  {Object} event_info Parsed response
 */
real_time_messaging.prototype.handle = function (event_info) {
	return this.callback(event_info);
};

/**
 * Creates a real-time-messaging client for Slack
 * @param  {Object}   params   The parameters required such as the token
 * @param  {Function} callback Callback that receives real time messaging events
 * @return {Object}            this
 */
module.exports.init = function (params, callback) {
	return new real_time_messaging(params, callback);
};

