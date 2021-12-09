var tap = require('tap');
var spawn = require('child_process').spawn;
var requireInject = require('require-inject');
var sinon = require('sinon');
var path = require('path');

var execPath = require.resolve('../');

function dwuploadExec (cmd, cb) {
	var command = [execPath].concat(cmd);
	var child = spawn(process.execPath, command);
	var stdout = '';
	var stderr = '';
	if (child.stdout) {
		child.stdout.on('data', function (chunk) {
			stdout += chunk;
		});
	}
	if (child.stderr) {
		child.stderr.on('data', function (chunk) {
			stderr += chunk;
		});
	}
	child.on('err', cb);
	function cleanOutput (lines) {
		return lines.trim().split('\n').filter(function (l) {
			return l.trim() !== '';
		}).join();
	}
	child.on('close', function (code) {
		cb(null, code, cleanOutput(stdout), cleanOutput(stderr));
	});
}

tap.test('call executable with no arguments', function (t) {
	dwuploadExec([], function (err, code, stdout, stderr) {
		if (err) { throw err; }
		t.equal(code, 1);
		t.equal(stdout, '');
		t.contains(stderr, /[Error: Either a file or cartridge must be declared. See --help for more details.]/);
		t.end();
	});
});

tap.test('upload a file', function (t) {
	var dwdavDelete = sinon.stub().returns(Promise.resolve());
	var dwdavPost = sinon.stub().returns(Promise.resolve());
	var dwdav = sinon.stub().returns({
		delete: dwdavDelete,
		post: dwdavPost
	});
	var dwupload = requireInject('../lib', {
		dwdav: dwdav
	});
	var conf = {
		_: [],
		file: 'test/fixtures/cartridge/index.html'
	};
	dwupload(conf, function (err) {
		t.notOk(err);
		t.ok(dwdav.calledWith(conf));
		t.ok(dwdavDelete.calledWith(conf.file));
		t.ok(dwdavPost.calledWith(conf.file));
		t.end();
	});
});

tap.test('delete a file', function (t) {
	var dwdavDelete = sinon.stub().returns(Promise.resolve());
	var dwdav = sinon.stub().returns({
		delete: dwdavDelete
	});
	var dwupload = requireInject('../lib', {
		dwdav: dwdav
	});
	var conf = {
		_: ['delete'],
		file: 'fixtures/cartridge/index.html'
	};
	dwupload(conf, function (err) {
		t.notOk(err);
		t.ok(dwdav.calledWith(conf));
		t.ok(dwdavDelete.calledWith(conf.file));
		t.end();
	});
});

tap.test('upload a cartridge', function (t) {
	var dwdavDelete = sinon.stub().returns(Promise.resolve());
	var dwdavPostAndUnzip = sinon.stub().returns(Promise.resolve());
	var dwdav = sinon.stub().returns({
		delete: dwdavDelete,
		postAndUnzip: dwdavPostAndUnzip
	});
	var dwupload = requireInject('../lib', {
		dwdav: dwdav
	});

	var conf = {
		_: [],
		cartridge: 'test/fixtures',
		root: 'test'
	};

	dwupload(conf, function (err) {
		t.notOk(err);
		t.ok(dwdav.calledWith(conf));
		t.ok(dwdavDelete.firstCall.calledWith('fixtures'));
		t.ok(dwdavPostAndUnzip.calledWith(path.resolve('test', 'fixtures.zip')));
		t.ok(dwdavDelete.secondCall.calledWith(path.resolve('test', 'fixtures.zip')));
		t.end();
	})
});

tap.test('upload a cartridge without root', function (t) {
	var dwdavDelete = sinon.stub().returns(Promise.resolve());
	var dwdavPostAndUnzip = sinon.stub().returns(Promise.resolve());
	var dwdav = sinon.stub().returns({
		delete: dwdavDelete,
		postAndUnzip: dwdavPostAndUnzip
	});
	var dwupload = requireInject('../lib', {
		dwdav: dwdav
	});

	var conf = {
		_: [],
		cartridge: 'test/fixtures'
	};

	dwupload(conf, function (err) {
		t.notOk(err);
		t.ok(dwdav.calledWith(conf));
		t.ok(dwdavDelete.firstCall.calledWith('fixtures'));
		t.ok(dwdavPostAndUnzip.calledWith(path.resolve('fixtures.zip')));
		t.ok(dwdavDelete.secondCall.calledWith(path.resolve('fixtures.zip')));
		t.end();
	})
});
