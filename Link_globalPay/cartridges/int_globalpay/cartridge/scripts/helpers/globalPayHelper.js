'use strict';


function getAccessToken() {
    var CacheMgr = require('dw/system/CacheMgr');
    var Site = require('dw/system/Site');

    var globalPayPreferences = require('*/cartridge/scripts/helpers/globalPayPreferences');
    var tokenCache = CacheMgr.getCache('GlobalPayAccessToken');

    var accessToken = tokenCache.get('accessToken:' + Site.getCurrent().ID, function () {
        var globalPayService = require('*/cartridge/scripts/services/globalPayService');
        var preferences = globalPayPreferences.getPreferences();
        var AccessToken = require('*/cartridge/scripts/dtos/AccessToken');

        var accessTokenRequest = new AccessToken.Request();

        accessTokenRequest.setGrantType(preferences.grantType);
        accessTokenRequest.setAppId(preferences.appId);
        accessTokenRequest.setAppKey(preferences.appKey);
        accessTokenRequest.setNonce(Date.now());

        var result = globalPayService.executeRequest(accessTokenRequest, AccessToken.Response);

        if (result.success) {
            return result.response.getToken();
        }
    });

    return accessToken || null;
}

function authenticate(data) {
    var globalPayService = require('*/cartridge/scripts/services/globalPayService');
    var Authentication = require('*/cartridge/scripts/dtos/Authentication');
    var Card = require('*/cartridge/scripts/dtos/paymentMethods/Card');
    
    var authenticationRequest = new Authentication.Request();
     authenticationRequest.setToken(getAccessToken());
    authenticationRequest.setAccountName(data.account_name);
    authenticationRequest.setPaymentMethod(data.payment_method);
   
    authenticationRequest.setChannel(data.channel);
    authenticationRequest.setCountry(data.country);
    authenticationRequest.setReference(data.reference);
    authenticationRequest.setAmount(data.amount);
    authenticationRequest.setCurrency(data.currency);
    authenticationRequest.setSource(data.source);
    authenticationRequest.setNotifications(data.notifications);

    var result = globalPayService.executeRequest(authenticationRequest, Authentication.Response);

    if (result.success) {
        return result.response;
    }

    return result;
}

function authorize(data) {
    var globalPayService = require('*/cartridge/scripts/services/globalPayService');
    var Authorize = require('*/cartridge/scripts/dtos/Authorize');

    var authorizeRequest = new Authorize.Request();
    authorizeRequest.setToken(getAccessToken());
    authorizeRequest.setAccountName(data.account_name);
    authorizeRequest.setChannel(data.channel);
    authorizeRequest.setCaptureMode(data.capture_mode);
    authorizeRequest.setType(data.type);
    authorizeRequest.setAmount(data.amount);
    authorizeRequest.setCurrency(data.currency);
    authorizeRequest.setReference(data.reference);
    authorizeRequest.setCountry(data.country);
    authorizeRequest.setPaymentMethod(data.payment_method);
    var result = globalPayService.executeRequest(authorizeRequest, Authorize.Response);
    if (result.success) {
        return result.response;
    }

    return result;
}

function capture(data) {
    var globalPayService = require('*/cartridge/scripts/services/globalPayService');
    var Capture = require('*/cartridge/scripts/dtos/Capture');

    var captureRequest = new Capture.Request();
    captureRequest.setToken(getAccessToken());
    captureRequest.setTransactionId(data.transaction_id);
    captureRequest.setAmount(data.amount);
    captureRequest.setCaptureSequence(data.capture_sequence);
    captureRequest.setTotalCaptureCount(data.total_capture_count);
    captureRequest.setPaymentMethod(data.payment_method);

    var result = globalPayService.executeRequest(captureRequest, Capture.Response);

    if (result.success) {
        return result.response;
    }

    return null;
}

function paypal(data){
    var Paypal = require('*/cartridge/scripts/dtos/Paypal');
    var globalPayService = require('*/cartridge/scripts/services/globalPayService');
    var paypalRequest = new Paypal.Request();
    paypalRequest.setToken(getAccessToken());
    paypalRequest.setAccountName(data.account_name);
    paypalRequest.setChannel(data.channel);
    paypalRequest.setCaptureMode(data.capture_mode);
    paypalRequest.setType(data.type);
    paypalRequest.setAmount(data.amount);
    paypalRequest.setCurrency(data.currency);
    paypalRequest.setReference(data.reference);
    paypalRequest.setCountry(data.country);
    paypalRequest.setPaymentMethod(data.payment_method);
    paypalRequest.setNotifications(data.notifications);
    var result = globalPayService.executeRequest(paypalRequest, Paypal.Response);
    if (result.success) {
        return result.response;
    }

    return null;
}

module.exports = {
    getAccessToken: getAccessToken,
    authenticate: authenticate,
    authorize: authorize,
    capture: capture,
    paypal: paypal
};
