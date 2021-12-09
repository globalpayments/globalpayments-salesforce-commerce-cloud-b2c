# dwdav
> Provide some basic methods for working with DW webdav server using [`request`](https://www.npmjs.com/package/request)

This is an under-the-hood library that is used by [`dwupload`](https://www.npmjs.com/package/dwupload) and [`dwlogs`](https://www.npmjs.com/package/dwlogs). Those are probably more likely what you're looking for.

## Installation

```shell
:; npm install dwdav
```

## Usage

```js
var dwdav = require('dwdav')(config);

dwdav.get().then(function (res) {
	console.log(res);
});
```

## config

Below are the default values for the `config` object.

- `hostname`: `localhost`
- `username`: `admin`
- `password`: `password`
- `folder`: `Cartridges`
- `version`: `version1`
- `root`: `.`

`root` option allows for path resolution of the file to upload _relative_ to a directory.
`p12` allows for 2-factor authentication.
`self-signed` allows for self-signed cert to be used.

## API

All methods are promise-based, i.e. they return a promise.

- `propfind(filePath, root)`
- `get(filePath, root)`
- `post(filePath, root)`
- `unzip(filePath, root)`
- `postAndUnzip(filePath, root)`
- `delete(filePath, root)`
- `mkcol(filePath, root)`

`filePath` is the path to a local file to be used.
