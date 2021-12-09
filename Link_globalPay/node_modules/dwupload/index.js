#!/usr/bin/env node

'use strict';

var config = require('@tridnguyen/config');
var log = require('./lib/log');

var argv = require('yargs')
.usage('Usage: $0 [command] [options]')
.command('delete', 'Delete a file or cartridge')
.command('watch', 'Watch for file changes')
.command('version', 'Get version information')
.example('$0 --cartridge app-storefront-core', 'uploading a cartridge')
.example('$0 watch --cartridge base', 'watch for changes and upload automatically')
.example('$0 delete --file app.js', 'delete a file')
.config(config('dw.json', {caller: false}))
.options({
	'file': {
		alias: 'f',
		describe: 'File to upload/ delete'
	},
	'cartridge': {
		alias: 'c',
		describe: 'Cartridge to upload/ delete. If this option is used, any "file" declared will be ignored.',
		array: true
	},
	'username': {
		alias: 'u',
		describe: 'Username to log into sandbox'
	},
	'password': {
		alias: 'p',
		describe: 'Password to log into sandbox'
	},
	'hostname': {
		alias: 'H',
		describe: 'Sandbox URL (without the "https://" prefix)'
	},
	'code-version': {
		alias: 'V',
		describe: 'Code version',
		default: 'version1'
	},
	'verbose': {
		describe: 'Be verbose'
	},
	'skip-upload': {
		describe: 'Skip initial upload when watching'
	},
	'root': {
		alias: 'r',
		describe: 'The root file path to resolve to relative to the actual file path on disk. This option is useful for deleting or uploading a file. Do not use this if uploading a cartridge, that is taken care of for you.',
		default: '.'
	},
	'exclude': {
		alias: 'x',
		describe: 'Exclude patterns. This works for both files and folders. To exclude a folder, use `**/foldername/**`. The `**` after is important, otherwise child directories of `foldername` will not be excluded.'
	},
	'p12': {
		describe: 'The p12 file to be used for 2-factor authentication.'
	},
	'passphrase': {
		describe: 'The passphrase to be used for 2-factor authentication.'
	},
	'self-signed': {
		describe: 'Allow for it to work with self-signed cert.'
	}
})
.help('h')
.alias('h', 'help')
.version().alias('version', 'v')
.argv;

// alias code-version back to version
argv.version = argv['code-version'];

require('./lib')(argv, function (err) {
	if (err) {
		log.error(err);
		process.exit(1);
	}
	log.info('Done!');
	process.exit();
});
