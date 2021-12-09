'use strict';

var Promise = require('bluebird');
var del = Promise.promisify(require('del'));
var DWDAV = require('dwdav');
var fs = require('fs');
var multimatch = require('multimatch');
var path = require('path');
var Queue = require('sync-queue');
var watch = require('watch');
var walk = require('walk');
var yazl = require('yazl');
var log = require('./log');
var chalk = require('chalk');
var notifier = require('node-notifier');

// return an array of all option values
// even if they're comma-separated
function processOpts(opt) {
	if (!opt) {
		return;
	}
	var opts = Array.isArray(opt) ? opt : [opt];
	// parse for comma
	return opts.reduce(function (arr, o) {
		return arr.concat(o.split(','));
	}, []);
}

module.exports = function (conf, cb) {
	if (conf.verbose) {
		console.log('Configured options:');
		console.log(conf);
	}
	var dwdav = DWDAV(conf);
	var command = conf._[0];
	var excludes = processOpts(conf.exclude);
	// default exclude patterns
	if (!excludes || !excludes.length) {
		excludes = ['*.swp'];
	}
	var matchOpts = {
		dot: true
	};

	if (!conf.file && !conf.cartridge) {
		return cb(new Error('Either a file or cartridge must be declared. See --help for more details.'));
	}
	var cartridges = processOpts(conf.cartridge);
	var files = processOpts(conf.file);
	var isCartridge = Boolean(cartridges);
	// having a cartridge flag will override file flag
	var toUploads = isCartridge ? cartridges : files;

	function deleteFile (filePath) {
		return dwdav.delete(filePath)
		.then(function () {
			log.success('Successfully deleted: ' + filePath);
			notification('file-delete', filePath);
		});
	}
	function uploadFile (filePath) {
		if (!fs.existsSync(filePath)) {
			return Promise.reject(new Error(filePath + ' does not exist.'));
		}
		return dwdav.delete(filePath)
		.then(function () {
			return dwdav.post(filePath);
		}).then(function () {
			log.success('Successfully uploaded: ' + filePath);
			notification('file-upload', filePath);
		});
	}
	function createDirectory (dirPath) {
		return dwdav.mkcol(dirPath)
		.then(function () {
			log.success('Successfully created directory: ' + dirPath);
			notification('directory-create', dirPath);
		});
	}
	function uploadCartridge (cartridge) {
		if (!fs.existsSync(cartridge)) {
			return Promise.reject(new Error(cartridge + ' does not exist'));
		}
		/*
		 * if `cartridge` is `path/to/cartridge`, then
		 * - `dirname` is `path/to`
		 * - `cartridgeName` is `cartridge`
		 * - `zipCartridgeName` is `cartridge.zip`
		 * - `realPath` is `full/system/path/to/cartridge/file.txt`
		 * - `metadataPath` is `cartridge/file.txt`
		 */
		var dirname = path.dirname(cartridge);
		var cwd = process.cwd();
		var cartridgeName = path.basename(cartridge);
		var zipCartridgeName = cartridgeName + '.zip';
		// put the zip cartridge in the root folder, default to cwd
		var zipCartridgePath = path.resolve(conf.root || '', zipCartridgeName);

		return new Promise(function (resolve, reject) {
			var walker = walk.walk(cartridge);
			var zipCartridge = new yazl.ZipFile();
			walker.on('file', function (root, filestats, next) {
				var realPath = path.resolve(root, filestats.name);
				var metadataPath = path.relative(dirname, realPath);
				// check both file name and file path
				if (!multimatch([root, filestats.name], excludes, matchOpts).length) {
					zipCartridge.addFile(realPath, metadataPath);
				}
				next();
			});
			walker.on('end', function () {
				zipCartridge.end();
			});
			walker.on('errors', function (root, nodeStatsArray, next) {
				reject(new Error('Error reading file in ' + root));
				next();
			});
			// Maybe there's a way to hook this stream directly to
			// the post method without the intermediate step of writing
			// to file
			zipCartridge.outputStream
				.pipe(fs.createWriteStream(zipCartridgePath))
				.on('close', function () {
					resolve();
				});
		}).then(function () {
			return dwdav.delete(cartridgeName)
		}).then(function () {
			// upload the zip file
			return dwdav.postAndUnzip(zipCartridgePath);
		}).then(function () {
			// delete the zip file on the webdav server
			return dwdav.delete(zipCartridgePath);
		}).then(function () {
			log.success('Successfully uploaded cartridge: ' + cartridge);
			notification('cartridge-upload', cartridge);
			// delete local zip file
			return del(zipCartridgePath);
		}, function (err) {
			// delete local zip even when there's an error with the upload
			return del(zipCartridgePath)
			.then(function () {
				// pass the error along
				return Promise.reject(err);
			});
		});
	}

	function showVersionInformation () {
		console.log('Current target version is: ' + chalk.blue.bold(conf.version));
		// get .version file, which lives at the parent Cartridges folder
		dwdav.get('../.version')
			.then((response) => {
				// parse .version file to find active version
				// sample
				/*
				###########################################
				# Generated file, do not edit.
				# Copyright (c) 2016 by Demandware, Inc.
				###########################################
				fileVersion=1
				maxVersions=0
				version1/1473910765602/1481569878000
				remote/1473910759457/1456936758000
				# end of file marker
				*/
				let lines = response.split('\n');
				let activeVersion = '';
				let otherVersions = [];
				for (let line of lines) {
					// get first non-commented line with slash
					if (line[0] === '#') {
						continue;
					}
					let slashIndex = line.indexOf('/');
					if (slashIndex < 0) {
						continue;
					}
					if (!activeVersion) {
						activeVersion = line.substring(0, slashIndex);
						continue;
					}
					otherVersions.push(line.substring(0, slashIndex));
				}
				console.log('Current active version is: ' + chalk.green.bold(activeVersion));
				console.log('Other versions available:');
				otherVersions.forEach((v) => {
					console.log('- ' + chalk.blue(v));
				})
			}).then(null, (err) => {
				console.error(err);
			});
	}

	function uploadOrDelete (toUploads) {
		if (conf['skip-upload']) {
			return Promise.resolve();
		}

		let action;

		if (command === 'delete') {
			action = deleteFile;
		} else {
			action = isCartridge ? uploadCartridge : uploadFile;
		}
		return toUploads.reduce(function (acc, toUpload) {
			return acc.then(function () {
				return action(toUpload);
			});
		}, Promise.resolve());
	}

	function watchAndUpload (toWatch) {
		var queue = new Queue();
		toWatch.forEach(function (dir) {
			watch.watchTree(dir, {
				filter: function (f, stat) {
					var dirname = path.dirname(f);
					var filename = path.basename(f);
					if (multimatch([dirname, filename], excludes, matchOpts).length) {
						return false;
					}
					return true;
				}
			}, function (f, curr, prev) {
				if (typeof f === 'object' && prev === null && curr === null) {
					// finished walking the tree
					// First item in f is the parent directory
					log.info('Watching ' + Object.keys(f)[0]);
				} else if (curr.nlink === 0) {
					// f was removed
					log.info(f + ' was removed.');
					queue.place(function () {
						deleteFile(f)
						.then(function () {
							queue.next();
						}, function (err) {
							log.error(err);
							queue.next();
						});
					})
				} else if (fs.lstatSync(f).isDirectory()) {
					log.info('Directory ' + f + ' was changed.');
					queue.place(function () {
						createDirectory(f)
						.then(function () {
							queue.next();
						}, function (err) {
							log.error(err);
							queue.next();
						});
					});
				} else {
					// f was created or changed
					log.info('File ' + f + ' was changed.');
					queue.place(function () {
						uploadFile(f)
						.then(function () {
							queue.next();
						}, function (err) {
							log.error(err);
							queue.next();
						});
					});
				}
			});
		});
	}

	// Notification defaults
	var notificationDefaults = {
		'file-upload': false,
		'cartridge-upload': false,
		'directory-create': false,
		'file-delete': false
	};
	// conf.notifications = conf.notifications || {};
	conf.notifications = Object.assign(notificationDefaults, conf.notifications || {});
	console.log(conf.notifications);

	// Path to icons used in notifications
	var notificationIcons = {
		"file-upload": path.resolve(__dirname, '../icons/font-awesome_4-7-0_cloud-upload.png'),
		"cartridge-upload": path.resolve(__dirname, '../icons/font-awesome_4-7-0_suitcase.png'),
		"directory-create": path.resolve(__dirname, '../icons/font-awesome_4-7-0_folder.png'),
		"file-delete": path.resolve(__dirname, '../icons/font-awesome_4-7-0_trash.png')
	}

	// Notification file lists
	var notificationFiles = {
		"file-upload": [],
		"cartridge-upload": [],
		"directory-create": [],
		"file-delete": []
	};

	// Notification timeouts (for throttled notifications)
	var notificationTimeouts = {
		"file-upload": null,
		"cartridge-upload": null,
		"directory-create": null,
		"file-delete": null
	};

	/**
	 * Trigger an OS-level notification
	 * @param {string} type The type of notification
	 * @param {string} filePath The path to the file or directory
	 */
	function notification(type, filePath) {
		// Ignore if type is invalid or notification type is disabled
		if (['file-upload', 'cartridge-upload', 'directory-create', 'file-delete'].indexOf(type) < 0 || conf.notifications[type] !== true) {
			return false
		}

		// Add the file basename to the list of uploaded files
		notificationFiles[type].push(path.basename(filePath));

		// Set a timeout for clearing the list of uploaded files
		clearTimeout(notificationTimeouts[type]);
		notificationTimeouts[type] = setTimeout(function(){
			notificationFiles[type] = [];
		}, 5000);

		// Generate notification title
		var title;
		switch (type) {
			case 'file-upload':
				title = 'Uploaded File' + (notificationFiles[type].length > 1 ? 's' : '');
				break;
			case 'cartridge-upload':
				title = 'Uploaded Cartridge' + (notificationFiles[type].length > 1 ? 's' : '');
				break;
			case 'directory-create':
				title = 'Created Director' + (notificationFiles[type].length > 1 ? 'ies' : 'y');
				break;
			case 'file-delete':
				title = 'Deleted File' + (notificationFiles[type].length > 1 ? 's' : '');
				break;
			default:
				title = 'Processed File' + (notificationFiles[type].length > 1 ? 's' : '');
				break;
		}

		// Trigger notification
		notifier.notify({
			title: 'dwupload - ' + title,
			message: notificationFiles[type].join(", "),
			icon: notificationIcons[type]
		});
	}

	// actions
	if (command === 'version') {
		showVersionInformation();
		return;
	}
	uploadOrDelete(toUploads)
		.then(function () {
			if (command !== 'watch') {
				return cb();
			}
			watchAndUpload(toUploads);
		}, cb);
};
