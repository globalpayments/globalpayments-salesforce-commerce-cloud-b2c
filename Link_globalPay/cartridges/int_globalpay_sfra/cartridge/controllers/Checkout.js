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
    var gpayToken =  globalPayHelper.getCheckoutToken();
    var BasketMgr = require('dw/order/BasketMgr');
    var currentBasket = BasketMgr.getCurrentBasket();
    var Locale = require('dw/util/Locale');
    var preferences = globalPayPreferences.getPreferences();
    var env = preferences.env;
    var gpayMerchantId=preferences.gpayMerchantId;
    var gpayMerchantName=preferences.gpayMerchantName;
    var gatewayMerchantId=preferences.gatewayMerchantId;
    var gpayEnv=preferences.gpayEnv;
    var  ArrayList = require('dw/util/ArrayList');
    var walletList = new ArrayList();

    //check if profile exists 
     if(!empty(customer.profile)){
    var wallet = require('dw/customer/CustomerMgr').getCustomerByCustomerNumber(customer.profile.customerNo).getProfile().getWallet();
    var walletJson = new Object();
       walletJson.pmt = [];
    for(var c=0; c < wallet.paymentInstruments.length; c++ ){
        var tokenJson = {}; 
        tokenJson.maskCard = wallet.paymentInstruments[c].maskedCreditCardNumber;
        tokenJson.uuid = wallet.paymentInstruments[c].UUID;
        tokenJson.pmttoken = wallet.paymentInstruments[c].creditCardToken;
        walletJson.pmt.push(tokenJson);
        walletList.add(tokenJson);
      }
     }
    var viewData = res.getViewData();
        viewData = {
            token : gpayToken,
            env : env,
            currency: currentBasket.currencyCode,
            country: Locale.getLocale(req.locale.id).country,
            gpaymerchantid:gpayMerchantId,
            gpaymerchantname:gpayMerchantName,
            gatewayMerchantId:gatewayMerchantId,
            gpayenv:gpayEnv,
            myWallet:walletList,
            walletJson : walletJson
        };
    res.setViewData(viewData);
    next();
});
module.exports = server.exports();