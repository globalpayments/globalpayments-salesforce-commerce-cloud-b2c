'use strict';

var globalPayService = require('*/cartridge/scripts/services/globalPayService');
/**
 *  Returns access token upon invoking this function
 * @returns {accessToken} - access token in form of string
 */
function getAccessToken() {
  var CacheMgr = require('dw/system/CacheMgr');
  var Site = require('dw/system/Site');

  var globalPayPreferences = require('*/cartridge/scripts/helpers/globalPayPreferences');
  var tokenCache = CacheMgr.getCache('GlobalPayAccessToken');

  var accessToken = tokenCache.get('accessToken:' + Site.getCurrent().ID, function () {
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

/**
 * Forms required data to be sent to service for authentication
 * @params {data} - data required to form authentication request
 * @returns {result} - returns authentication response
 */
function authenticate(data) {
  var Authentication = require('*/cartridge/scripts/dtos/Authentication');

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
/**
 * Forms required data to be sent to service for tokenization
 * @params {data} - data required to form Tokenization request
 * @returns {result} - returns Tokenize response
 */
function tokenize(data) {
  var Tokenize = require('*/cartridge/scripts/dtos/paymentMethods/PaymentTokenization');
  var tokenizeRequest = new Tokenize.Request();
  tokenizeRequest.setToken(getAccessToken());
  tokenizeRequest.setusage_mode(data.usage_mode);
  tokenizeRequest.setReference(data.reference);
  tokenizeRequest.setFirst_name(data.first_name);
  tokenizeRequest.setLast_name(data.last_name);
  tokenizeRequest.setentry_mode(data.entry_mode);
  tokenizeRequest.setcard(data.card);
  var result = globalPayService.executeRequest(tokenizeRequest, Tokenize.Response);
  if (result.success) {
    return result.response;
  }

  return null;
}
/**
 * Forms required data to be sent to service to detokenize.
 * @params {data} - data required to form DeTokenization request
 * @returns {result} - returns Tokenize response
 */
function detokenize(data) {
  var DeleteTokenize = require('*/cartridge/scripts/dtos/paymentMethods/DeletePaymentTokenization');

  var deletetokenizeRequest = new DeleteTokenize.Request();
  deletetokenizeRequest.setToken(getAccessToken());
  deletetokenizeRequest.setcctokenId(data.id);
  var result = globalPayService.executeRequest(deletetokenizeRequest, DeleteTokenize.Response);
  if (result.success) {
    return result.response;
  }
  return null;
}
/**
 * Forms required data to be sent to service to authorize.
 * @params {data} - data required to form authorize request
 * @returns {result} - returns authorize response
 */
function authorize(data) {
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
/**
 * Forms required data to be sent to service to get refund.
 * @params {data} - data required to form refund request
 * @returns {result} - returns refund response
 */
function refund(data) {
  var Refund = require('*/cartridge/scripts/dtos/Refund');

  var refundRequest = new Refund.Request();
  refundRequest.setToken(getAccessToken());
  refundRequest.setTransactionId(data.transaction_id);
  refundRequest.setAmount(data.amount);

  var result = globalPayService.executeRequest(refundRequest, Refund.Response);

  if (result.success) {
    return result.response;
  }

    return result;
}
/**
 * Forms required data to be sent to service to perform capture call.
 * @params {data} - data required to form capture request
 * @returns {result} - returns capture response
 */
function capture(data) {
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

  return result.error;
}
/**
 * Forms required data to be sent to service to perform paypal transaction.
 * @params {data} - data required to form paypal transaction request
 * @returns {result} - returns paypal response
 */
function paypal(data) {
  var Paypal = require('*/cartridge/scripts/dtos/Paypal');
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
/**
 * Forms required data to be sent to service to perform googlepay transaction.
 * @params {data} - data required to form googlepay transaction request
 * @returns {result} - returns googlepay response
 */
function gpay(data) {
  var Gpay = require('*/cartridge/scripts/dtos/GooglePay');
  var gpayRequest = new Gpay.Request();
  gpayRequest.setToken(getAccessToken());
  gpayRequest.setAccountName(data.account_name);
  gpayRequest.setChannel(data.channel);
  gpayRequest.setCaptureMode(data.capture_mode);
  gpayRequest.setType(data.type);
  gpayRequest.setAmount(data.amount);
  gpayRequest.setCurrency(data.currency);
  gpayRequest.setReference(data.reference);
  gpayRequest.setCountry(data.country);
  gpayRequest.setPaymentMethod(data.payment_method);

  var result = globalPayService.executeRequest(gpayRequest, Gpay.Response);
  if (result.success) {
    return result.response;
  }
  return null;
}
function applePay(data)
{
    var applePay = require('*/cartridge/scripts/dtos/ApplePay');
    var globalPayService = require('*/cartridge/scripts/services/globalPayService');
    var applePayRequest = new applePay.Request();
    applePayRequest.setToken(getAccessToken());
    applePayRequest.setAccountName(data.account_name);
    applePayRequest.setChannel(data.channel);
    applePayRequest.setCaptureMode(data.capture_mode);
    applePayRequest.setType(data.type);
    applePayRequest.setAmount(data.amount);
    applePayRequest.setCurrency(data.currency);
    applePayRequest.setReference(data.reference);
    applePayRequest.setCountry(data.country);
    applePayRequest.setPaymentMethod(data.payment_method);
  
    var result = globalPayService.executeRequest(applePayRequest, applePay.Response);
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
    refund:refund,
    paypal: paypal,
    gpay:gpay,
    tokenize:tokenize,
    detokenize:detokenize,
    applePay:applePay
};
