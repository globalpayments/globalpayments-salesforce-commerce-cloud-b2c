'use strict';

var assign = require('lodash.assign');
var isString = require('lodash.isstring');
var isObject = require('lodash.isobject');
var caller = require('caller');
var path = require('path');
var console = require('better-console');

module.exports = function (defaults, configPath, opts) {
	var _configPath = configPath;
	var _opts = {
		caller: true
	};
	var config = {};

	if (isObject(defaults)) {
		config = defaults;
	}
	if (isObject(opts)) {
		assign(_opts, opts);
	}
	// if there's only one argument
	if (arguments.length === 1) {
		// if it is an object, return it right away
		if (isObject(defaults)) {
			return config;
		// if it is a string, consider it file path
		} else if (isString(defaults)) {
			_configPath = defaults;
		}
	} else if (arguments.length === 2) {
		// pass in configPath and opts only
		if (isString(defaults)) {
			_configPath = defaults;
			assign(_opts, configPath);
		// if pass in 2 objects, bail early
		} else if (isObject(defaults) && !isString(configPath)) {
			return config;
		}
	}

	if (_opts.caller) {
		_configPath = path.resolve(path.dirname(caller()), _configPath);
	} else {
		_configPath = path.resolve(process.cwd(), _configPath);
	}

	try {
		config = assign(config, require(_configPath));
	} catch (e) {
		if (_opts.verbose) {
			console.error(e);
		}
	}
	return config;
};
