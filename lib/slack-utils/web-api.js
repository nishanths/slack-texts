const
	request = require('request'),
	ws = require('ws'),
	querystring = require('querystring'),
	base_url = 'https://slack.com/api/',

	/**
	 * Constructs a client for a provided Slack API method
	 * @param  {String}   method   The method name
	 * @param  {Object}   params   The required paramters for the request such as the token
	 * @param  {Function} callback The callback that receives the response
	 * @return {Object}            this
	 */
	web_api = function (method, params, callback) {
		this.method = method;
		this.params = params;
		this.callback = callback;

		return this;
	};

/**
 * Performs the outgoing request
 * @param  {Function} fn The callback that receives the success response
 */
web_api.prototype.outgoing_request = function (fn) {
	var self = this;
	
	request(this.encoded_url(), function (err, res, body) {
		if (!err && res.statusCode == 200) {
			return fn(JSON.parse(body));
		}
	});
};

/**
 * Kick off the request. The result will be provided to the callback function provided during initialization
 */
web_api.prototype.call = function() {
	var self = this;
	this.outgoing_request(function (res) {
		return self.callback(res);
	});
};

/**
 * Encodes the URL for the request
 * @return {String} Encoded URL
 */
web_api.prototype.encoded_url = function() {
	return base_url + this.method + "?" + querystring.stringify(this.params);
};

/**
 * Constructs a client for a provided Slack API method
 * @param  {String}   method   The method name
 * @param  {Object}   params   The required paramters for the request such as the token
 * @param  {Function} callback The callback that receives the response
 * @return {Object}            this
 */
module.exports.init = function (method, params, callback) {
	return new web_api(method, params, callback);
};
