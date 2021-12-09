'use strict';

var config = {
	hostname: 'example-sitegenesis-dw.demandware.net',
	password: 'password'
};
var sinon = require('sinon');
var requestSpy = sinon.spy()
var requireInject = require('require-inject');

var DWDAV = requireInject('../', {
	request: requestSpy
});

var dwdav = DWDAV(config);

var filename = 'test/fixture.html';
var directoryName = 'test';
var webdavPath = '/on/demandware.servlet/webdav/Sites/Cartridges/';
var version = 'version1';

var opts = {
	auth: {
		user: 'admin', // default username
		password: config.password
	},
	strictSSL: false,
	baseUrl: 'https://' + config.hostname + webdavPath + version
}

var optsBearer = {
	auth: {
		bearer: '__token__'
	},
	strictSSL: false,
	baseUrl: 'https://' + config.hostname + webdavPath + version
}

var tap = require('tap');
tap.test('propfind', function (t) {
	dwdav.propfind();
	// first argument of the first call
	t.deepEqual(requestSpy.args[0][0], Object.assign({}, opts, {
		headers: {
			Depth: 1
		},
		method: 'PROPFIND',
		uri: '/'
	}));
	t.end();
});

tap.test('post', function (t) {
	dwdav.post(filename).then(null, function (err) {
		// ignore error about the fake request object to pipe to
		if (err.message !== 'Cannot read property \'on\' of undefined') {
			console.error(err.stack);
		}
	});
	// second call
	var result = requestSpy.args[1][0];
	result.uri = result.uri.replace(/\\/g, '/'); // on Windows machine you would get reversed slashes, this should fix them
	t.deepEqual(result, Object.assign({}, opts, {
		method: 'PUT',
		uri: '/' + filename
	}));
	t.end();
});

tap.test('unzip', function (t) {
	dwdav.unzip(filename);
	var result = requestSpy.args[2][0];
	result.uri = result.uri.replace(/\\/g, '/'); // on Windows machine you would get reversed slashes, this should fix them
	t.deepEqual(result, Object.assign({}, opts, {
		method: 'POST',
		form: {
			method: 'UNZIP'
		},
		uri: '/' + filename
	}));
	t.end();
});

tap.test('delete', function (t) {
	dwdav.delete(filename);
	var result = requestSpy.args[3][0];
	result.uri = result.uri.replace(/\\/g, '/'); // on Windows machine you would get reversed slashes, this should fix them
	t.deepEqual(result, Object.assign({}, opts, {
		method: 'DELETE',
		uri: '/' + filename
	}))
	t.end();
});

tap.test('create directory', function (t) {
	dwdav.mkcol(directoryName);
	t.deepEqual(requestSpy.args[4][0], Object.assign({}, opts, {
		method: 'MKCOL',
		uri: '/' + directoryName
	}));
	t.end();
});

tap.test('root directory option', function (t) {
	var dwdav = DWDAV(Object.assign({
		root: 'test'
	}, config));
	dwdav.post(filename).then(null, function (err) {
		// ignore error about the fake request object to pipe to
		if (err.message !== 'Cannot read property \'on\' of undefined') {
			console.error(err.stack);
		}
	});
	t.deepEqual(requestSpy.args[5][0], Object.assign({}, opts, {
		method: 'PUT',
		uri: '/fixture.html'
	}));
	t.end();
});

tap.test('upload file that does not exist', function (t) {
	dwdav.post('test/notexist.js').then(null, function (err) {
		t.equal(err.message, 'test/notexist.js does not exist.');
		t.end();
	});
})

tap.test('bearer auth', function (t) {
	var dwdav = DWDAV({
		hostname: 'example-sitegenesis-dw.demandware.net',
		bearer: '__token__'
	});
	dwdav.propfind();
	t.deepEqual(requestSpy.args[6][0], Object.assign({}, optsBearer, {
		headers: {
			Depth: 1
		},
		method: 'PROPFIND',
		uri: '/'
	}));
	t.end();
});

tap.test('bearer auth in favor of user/pass', function (t) {
	var dwdav = DWDAV({
		hostname: 'example-sitegenesis-dw.demandware.net',
		username: 'foo',
		password: 'bar',
		bearer: '__token__'
	});
	dwdav.propfind();
	t.deepEqual(requestSpy.args[7][0], Object.assign({}, optsBearer, {
		headers: {
			Depth: 1
		},
		method: 'PROPFIND',
		uri: '/'
	}));
	t.end();
});