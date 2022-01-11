'use strict';

/**
 * @namespace Checkout
 */
/* eslint-disable */
var page = module.superModule;
var server = require('server');
server.extend(page);
server.append('Begin', function (req, res, next) {
    var globalPayHelper = require('int_globalpay/cartridge/scripts/helpers/globalPayHelper');  
    var gpayToken =  globalPayHelper.getAccessToken();
    var env =   globalPayHelper.getPreferences().env;
    var viewData = res.getViewData();
        viewData = {
            token : gpayToken,
            env : env
        };
    res.setViewData(viewData);
    next();
});
module.exports = server.exports();
