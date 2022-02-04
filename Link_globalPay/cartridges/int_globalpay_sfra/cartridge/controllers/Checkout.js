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
    var BasketMgr = require('dw/order/BasketMgr');
    var currentBasket = BasketMgr.getCurrentBasket();
    var Locale = require('dw/util/Locale');
    var preferences = globalPayPreferences.getPreferences();
    var env = preferences.env;
    var gpayMerchantId=preferences.gpayMerchantId;
    var gpayMerchantName=preferences.gpayMerchantName;
    var gatewayMerchantId=preferences.gatewayMerchantId;
    var gpayEnv=preferences.gpayEnv;

    var viewData = res.getViewData();
        viewData = {
            token : gpayToken,
            env : env,
            currency: currentBasket.currencyCode,
            country: Locale.getLocale(req.locale.id).country,
            gpaymerchantid:gpayMerchantId,
            gpaymerchantname:gpayMerchantName,
            gatewayMerchantId:gatewayMerchantId,
            gpayenv:gpayEnv
        };
    res.setViewData(viewData);
    next();
});
module.exports = server.exports();