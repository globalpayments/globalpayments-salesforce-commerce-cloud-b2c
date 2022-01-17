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
function tokenize(data) {
  var globalPayService = require('*/cartridge/scripts/services/globalPayService');
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
function detokenize(data) {
  var globalPayService = require('*/cartridge/scripts/services/globalPayService');
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

function gpay(data)
{
    var Gpay = require('*/cartridge/scripts/dtos/GooglePay');
    var globalPayService = require('*/cartridge/scripts/services/globalPayService');
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
    // if (result.success) {
    //     return result.response;
    // }
    result.success=true;
    result.response=res();
    return result;
}
function res()
{
   var response= {
        "id": "TRN_uzFr7t4VOqxdLDI44hHmXIjHtOOE8d",
        "time_created": "2021-05-03T21:23:39.718Z",
        "type": "SALE",
        "status": "INITIATED",
        "channel": "CNP",
        "capture_mode": "AUTO",
        "authorization_mode": "PARTIAL",
        "amount": "11099",
        "currency": "USD",
        "country": "US",
        "merchant_id": "MER_c4c0df11039c48a9b63701adeaa296c3",
        "merchant_name": "Sandbox_merchant_2",
        "account_id": "TRA_6716058969854a48b33347043ff8225f",
        "account_name": "Transaction_Processing",
        "reference": "stringst",
        "batch_id": "BAT_234234234",
        "payment_method": {
          "id": "PMT_31087d9c-e68c-4389-9f13-39378e166ea5",
          "fingerprint_presence_indicator": "NEW",
          "fingerprint": "string",
          "result": "string",
          "message": "string",
          "entry_mode": "ECOM",
          "authentication": {
            "three_ds": {
              "value_result": "string"
            }
          },
          "digital_wallet": {
            "token": "string",
            "token_format": "CARD_NUMBER",
            "cryptogram": "string",
            "provider": "APPLEPAY",
            "expiry_month": "05",
            "expiry_year": "25",
            "eci": "5",
            "cvv": "852",
            "cvv_indicator": "PRESENT",
            "avs_address": "Apt 123",
            "avs_postal_code": "TGX562"
          },
          "apm": {
            "provider": "TESTPAY",
            "redirect_url": "string",
            "session_token": "EC-0SR89134FA420913U",
            "fund_status": "RECEIVED",
            "wait_notification": 0,
            "optional_redirect": 0,
            "provider_transaction_reference": "49wnfs9w434234",
            "provider_time_created": "49wnfs9w434234",
            "provider_payer_name": "James Mason",
            "bank": {
              "name": "string",
              "identifier_code": "string",
              "iban": "string",
              "code": "string",
              "account_number": "string"
            },
            "mandate": {
              "code": "string"
            }
          },
          "card": {
            "masked_number_last4": "stringstring",
            "tag_response": "string",
            "authcode": "string",
            "brand": "VISA",
            "brand_reference": "string",
            "brand_time_reference": "string",
            "cvv_result": "MATCHED",
            "avs_address_result": "MATCHED",
            "avs_postal_code_result": "MATCHED",
            "avs_action": "PROMPT",
            "provider": {
              "card.provider.result": "string",
              "card.provider.cvv_result": "string",
              "card.provider.avs_result": "string",
              "card.provider.avs_address_result": "string",
              "card.provider.avs_postal_code_result": "string"
            }
          },
          "bank_transfer": {
            "name": "High Street Bank",
            "masked_number_last4": "string",
            "number_type": "SAVING"
          }
        },
        "currency_conversion": {
          "payer_amount": "string",
          "payer_currency": "string",
          "conversion_rate": "string",
          "margin_rate_percentage": "string",
          "commission_percentage": "string",
          "exchange_rate_source": "string",
          "exchange_source_time": "string"
        },
        "action": {
          "id": "string",
          "type": "string",
          "time_created": "2021-05-03T21:23:39.718Z",
          "result_code": "SUCCESS",
          "app_id": "U1lRHKomEn7DN907RCDPxVhyMfiMLcfy",
          "app_name": "demo_app"
        }
      };
      return response;
}

module.exports = {
    getAccessToken: getAccessToken,
    authenticate: authenticate,
    authorize: authorize,
    capture: capture,
    paypal: paypal,
    gpay:gpay,
    tokenize:tokenize,
    detokenize:detokenize
};
