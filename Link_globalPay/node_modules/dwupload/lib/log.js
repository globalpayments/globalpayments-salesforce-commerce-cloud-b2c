var chalk = require('chalk');

var info = chalk.blue;
var success = chalk.green;
var error = chalk.red;

const types = {
	info: chalk.blue,
	success: chalk.green,
	error: chalk.red
};

function addTimePrefix(str) {
	return chalk.reset('[' + new Date().toLocaleTimeString('en-US', {hour12: false}) +
		'] ') + str
}

function makeLogMethod(method, str, opts = {silent: false, time: true}) {
	let logMethod = console.log.bind(console);
	if (method === 'error') {
		logMethod = console.error.bind(console);
	}
	return function (str, silent) {
		logMethod(addTimePrefix(types[method](str)));
	}
}

module.exports = {
	info: makeLogMethod('info'),
	success: makeLogMethod('success'),
	error: makeLogMethod('error')
};
