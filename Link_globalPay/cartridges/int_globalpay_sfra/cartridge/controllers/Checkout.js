'use strict';

/**
 * @namespace Checkout
 */
/* eslint-disable */
var page = module.superModule;
var server = require('server');
server.extend(page);
server.append('Begin', function (req, res, next) {
    var globalPayPreferences = require('*/cartridge/scripts/helpers/globalPayPreferences');
    var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper'); 
    var gpayToken =  globalPayHelper.getAccessToken();
    var preferences = globalPayPreferences.getPreferences();
    var env = preferences.env;
    var viewData = res.getViewData();
        viewData = {
            token : gpayToken,
            env : env
        };
    res.setViewData(viewData);
    next();
});
module.exports = server.exports();