'use strict';

var request = require('request');
var parse = require('xml-parser');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

function findWhere(a, b) {
	return _.find(a, function(n){
		if(_.matches(b)(n)){
		   return n;
		}
	});
}

function DWDAV (config) {
	this.config = _.extend({
		hostname: 'localhost',
		username: 'admin',
		password: 'password',
		folder: 'Cartridges',
		root: '.'
	}, config);
}

DWDAV.prototype.getOpts = function () {
	var opts = {
		baseUrl: 'https://' + this.config.hostname + '/on/demandware.servlet/webdav/Sites/' + this.config.folder + '/',
		uri: '/',
		auth: {
			user: this.config.username,
			password: this.config.password
		},
		strictSSL: false
	};
	// Oauth based access using bearer, void user/pass in favor of token
	if (this.config.bearer) {
		opts.auth = {
			bearer: this.config.bearer
		};
	}
	// add version to path if working with Cartridges folder
	if (this.config.folder === 'Cartridges') {
		opts.baseUrl += this.config.version || 'version1';
	}
	// Support for 2fa
	if (this.config.p12 && this.config.hostname.indexOf('cert') === 0) {
		opts.strictSSL = true;
		opts.pfx = fs.readFileSync(this.config.p12);
		opts.passphrase = this.config.passphrase;
		opts.honorCipherOrder = true;
		opts.securityOptions = 'SSL_OP_NO_SSLv3';
		opts.secureProtocol = 'TLSv1_2_method';
		// see http://stackoverflow.com/questions/14088787/hostname-ip-doesnt-match-certificates-altname
		// and https://nodejs.org/api/tls.html#tls_tls_connect_port_host_options_callback
		opts.checkServerIdentity = function () {}; 

		if (this.config['self-signed']) {
			opts.rejectUnauthorized = false;
		}
	}
	return opts;
};

function getPropChild (prop, name) {
	var propChild = findWhere(prop.children, {name: name});
	if (propChild && propChild.content) {
		return propChild.content;
	}
	return '';
}

DWDAV.prototype.propfind = function (filePath, root) {
	var self = this;
	var rootFolder = path.join(process.cwd(), root || self.config.root);
	var uriPath = path.relative(rootFolder, filePath || '.');
	return new Promise(function (resolve, reject) {
		request(_.extend(self.getOpts(), {
			headers: {
				Depth: 1
			},
			uri: '/' + uriPath,
			method: 'PROPFIND'
		}), function (err, res, body) {
			if (err) {
				return reject(err);
			}
			if (res.statusCode >= 400) {
				return reject(new Error(res.statusMessage));
			}
			var response = parse(body);
			// get "response" children
			var responses = _.filter(response.root.children, function (c) {
				return c.name === 'response';
			})
			// get href and display name of each response
			.map(function (res) {
				var href = findWhere(res.children, {name: 'href'}).content;
				var prop = findWhere(findWhere(res.children, {name: 'propstat'}).children, {name: 'prop'});
				return {
					href: href,
					name: getPropChild(prop, 'displayname'),
					creationDate: getPropChild(prop, 'creationdate'),
					lastModified: getPropChild(prop, 'getlastmodified'),
					contentLength: getPropChild(prop, 'getcontentlength'),
					contentType: getPropChild(prop, 'getcontenttype'),
					eTag: getPropChild(prop, 'getetag')
				};
			});
			return resolve(responses);
		});
	});
};

DWDAV.prototype.get = function (filePath, root) {
	var self = this;
	var rootFolder = path.join(process.cwd(), root || self.config.root);
	var uriPath = path.relative(rootFolder, filePath);
	return new Promise(function (resolve, reject) {
		request(_.extend(self.getOpts(), {
			uri: '/' + uriPath,
			method: 'GET',
			encoding: null
		}), function (err, res, body) {
			if (err) {
				return reject(err);
			}
			if (res.statusCode >= 400) {
				return reject(new Error(res.statusMessage));
			}
			resolve(body);
		});
	});
};

DWDAV.prototype.post = function (filePath, root) {
	if (!fs.existsSync(filePath)) {
		return Promise.reject(new Error(filePath + ' does not exist.'));
	}
	var self = this;
	var rootFolder = path.join(process.cwd(), root || self.config.root);
	var uriPath = path.relative(rootFolder, filePath);
	return new Promise(function (resolve, reject) {
		var req = request(_.extend(self.getOpts(), {
			uri: '/' + uriPath,
			method: 'PUT'
		}), function (err, res, body) {
			if (err) {
				return reject(err);
			}
			if (res.statusCode >= 400) {
				return reject(new Error(res.statusMessage));
			}
			resolve(body);
		});
		fs.createReadStream(filePath).pipe(req);
	});
};

DWDAV.prototype.unzip = function (filePath, root) {
	var self = this;
	var rootFolder = path.join(process.cwd(), root || self.config.root);
	var uriPath = path.relative(rootFolder, filePath);

	return new Promise(function (resolve, reject) {
		request(_.extend(self.getOpts(), {
			uri: '/' + uriPath,
			method: 'POST',
			form: {
				method: 'UNZIP'
			}
		}), function (err, res, body) {
			if (err) {
				return reject(err);
			}
			if (res.statusCode >= 400) {
				return reject(new Error(res.statusMessage));
			}
			resolve(body);
		});
	});
};

DWDAV.prototype.postAndUnzip = function (filePath, root) {
	var self = this;
	return self.post(filePath, root)
		.then(function () {
			return self.unzip(filePath, root);
		});
};

DWDAV.prototype.delete = function (filePath, root) {
	var self = this;
	var rootFolder = path.join(process.cwd(), root || self.config.root);
	var uriPath = path.relative(rootFolder, filePath);

	return new Promise(function (resolve, reject) {
		request(_.extend(self.getOpts(), {
			uri: '/' + uriPath,
			method: 'DELETE'
		}), function (err, res, body) {
			if (err) {
				return reject(err);
			}
			// it's ok to ignore 404 error if the file is not found
			if (res.statusCode >= 400 && res.statusCode !== 404) {
				return reject(new Error(res.statusMessage));
			}
			resolve(body);
		});
	});
};

DWDAV.prototype.mkcol = function (filePath, root) {
	var self = this;
	var rootFolder = path.join(process.cwd(), root || self.config.root);
	var uriPath = path.relative(rootFolder, filePath);

	return new Promise(function (resolve, reject) {
		request(_.extend(self.getOpts(), {
			uri: '/' + uriPath,
			method: 'MKCOL'
		}), function (err, res, body) {
			if (err) {
				return reject(err);
			}
			if (res.statusCode >= 400) {
				return reject(new Error(res.statusMessage));
			}
			resolve(body);
		});
	});
};

module.exports = function (config) {
	return new DWDAV(config);
};

module.exports.DWDAV = DWDAV;
