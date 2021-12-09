# dwupload
> Upload a storefront cartridge to a Demandware WebDAV server from command line.

## Who do I talk to?

* Maintainer: @intel352
* [Commerce Cloud Community Slack](https://sfcc-community.slack.com)

## Contributing

1. Create a [fork](https://bitbucket.org/demandware/dwupload/fork), if you don't already have one
2. Ensure your fork is caught up (message from Bitbucket shows up on your fork main page, if you are not current on commits)
3. Create a new branch in your fork to hold your changes
4. Submit a [pull request](https://bitbucket.org/demandware/dwupload/pull-requests/new)

## Installation

```shell
:; npm install -g dwupload
```

Instead of installing this as a global npm package, you can install it locally and access it as `./node_modules/.bin/dwupload`.

## Usage

```shell
# uploading a cartridge
:; dwupload --hostname example.demandware.net --username admin --password password --cartridge app_storefront_core  --code-version version1

# uploading file(s) using configuration in `dw.json`
:; dwupload --file path/to/app.js --file path/to/style.css

# watch for file changes and upload automatically
:; dwupload watch --cartridge app_storefront_controllers

# delete a file, with root option
:; dwupload delete --file rootDir/path/to/file --root rootDir

# 2-factor authentication
:; dwupload --hostname cert.example.demandware.net --username admin --password password --p12 admin.p12 --passphrase passphrase
:; dwupload --hostname cert.example.demandware.net --p12 admin.12 --passphrase passphrase --self-signed

# get version information
:; dwupload version
```

*In case you're running the command within an other directory than the cartridges directory, don't forget to use the `--root` option (in the command or in the dw.json file)*
See `--help` for more information.


### Exclude patterns
Exclude patterns can be declared via the `-x` or `--exclude` flag. This work for both file and folder exclude patterns. For example:

```
*.swp
**/node_modules/**
```

Please note that the `**` after the folder name is important. Without it, child directories of `node_modules` would still be included.

## Config file
Instead of passing command line options every single time, you can store your config options in a `dw.json` file in the current working directory instead. For example:

```js
{
        "hostname": "example.demandware.net",
        "username": "user",
        "password": "password",
        "cartridge": ["cartridgeA", "cartridgeB"],
        "root": "path/to/root",
        "code-version": "version2",
        "p12": "path/to/file.p12",
        "passphrase": "passphrase"
}
```

Command line options will always **override** the options declared in the config file.
