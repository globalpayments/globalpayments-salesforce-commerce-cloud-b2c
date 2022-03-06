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

  return result;
}
/**
 * Forms required data to be sent to service for tokenization
 * @params {data} - data required to form Tokenization request
 * @returns {result} - returns Tokenize response
 */
 function updateTokenUsagemode(data) {
  var UpdateTokenMode = require('*/cartridge/scripts/dtos/paymentMethods/UpdatePaymentTokenizationMode');
  var tokenupdateRequest = new UpdateTokenMode.Request();
  tokenupdateRequest.setToken(getAccessToken());
  tokenupdateRequest.setusage_mode(data.usage_mode);
  tokenupdateRequest.setcctokenId(data.paymentInformationID);

  var result = globalPayService.executeRequest(tokenupdateRequest, UpdateTokenMode.Response);
  if (result.success) {
    return result.response;
  }
  return result;
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
  return result;
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
function  threeDsStepone(data) {
  var threeDsStepone = require('*/cartridge/scripts/dtos/ThreeDsStepone');
  var globalPayService = require('*/cartridge/scripts/services/globalPayService');
  var threeDsSteponeReq = new threeDsStepone.Request();
      threeDsSteponeReq.setToken(getAccessToken());
      threeDsSteponeReq.setThreeDs(data.three_ds);
      threeDsSteponeReq.setAuthId(data.auth_id);
      threeDsSteponeReq.setMerchantContactUrl(data.merchant_contact_url);
      threeDsSteponeReq.setMethodUrlCompletionStatus(data.method_url_completion_status);
     // threeDsSteponeReq.setPayer(data.payer);
     // threeDsSteponeReq.setPayerPriorThreeDsAuthenticationData(data.payer_prior_three_ds_authentication_data);
     // threeDsSteponeReq.setRecurringAuthorizationData(data.recurring_authorization_data);
     // threeDsSteponeReq.setPayerLoginData(data.payer_login_data);
      threeDsSteponeReq.setOrder(data.order);
      threeDsSteponeReq.setPaymentMethod(data.payment_method);
      threeDsSteponeReq.setBrowserData(data.browser_data);

    var result = globalPayService.executeRequest(threeDsSteponeReq, threeDsStepone.Response);
      if (result.success) {
          return result.response;
      }
      return null;
  }

  function threeDsSteptwo(data){
    var threeDsSteptwo = require('*/cartridge/scripts/dtos/ThreeDsSteptwo');
    var globalPayService = require('*/cartridge/scripts/services/globalPayService');
    var threeDsSteptwoReq = new threeDsSteptwo.Request();
        threeDsSteptwoReq.setToken(getAccessToken());
        threeDsSteptwoReq.setAuthId(data.auth_id);
    var result = globalPayService.executeRequest(threeDsSteptwoReq, threeDsSteptwo.Response);
      if (result.success) {
          return result.response;
      }
      return null;
  }


  function payPalCapture(data){
    var payPalCapture = require('*/cartridge/scripts/dtos/PayPalCapture');
    var globalPayService = require('*/cartridge/scripts/services/globalPayService');
    var payPalCaptureRequest = new payPalCapture.Request();
        payPalCaptureRequest.setToken(getAccessToken());
        payPalCaptureRequest.setTransactionId(data.transactionId);
        var result = globalPayService.executeRequest(payPalCaptureRequest, payPalCapture.Response);
        if (result.success) {
            return result.response;
        }
        return null;
  }


  function initiateRequest(data){

    var initiateRequest = 
    {
      three_ds: {
          source: "BROWSER",
          preference: "NO_PREFERENCE"
      },
      account_name:"",
      channel: "CNP",
      amount: "5",
      currency: "USD",
      country: "US",
      method_url_completion_status: "YES",
      payment_method: {
          id: data.payment_method.id
      },
      order: {
          time_created_reference: "2019-04-26T10:19:32.552327Z",
          amount: "1001",
          currency: "USD",
          reference: "3400dd37-101d-4940-be15-3c963b6109b3",
          address_match_indicator: "false",
          shipping_address: {
              line1: "Apartment 852",
              line2:"Complex 741",
              line3: "House 963",
              city: "Chicago",
              postal_code: "50001",
              state: "IL",
              country: "840"
          },
          gift_card_count: "01",
          gift_card_currency: "USD",
          gift_card_amount: "25000",
          delivery_email: "james.mason@example.com",
          delivery_timeframe: "ELECTRONIC_DELIVERY",
          shipping_method: "ANOTHER_VERIFIED_ADDRESS",
          shipping_name_matches_cardholder_name: "true",
          preorder_indicator: "MERCHANDISE_AVAILABLE",
          preorder_availability_date: "2019-04-18",
          reorder_indicator: "FIRST_TIME_ORDER",
          transaction_type: "GOODS_SERVICE_PURCHASE"
      },
      payer: {
          reference: "6dcb24f5-74a0-4da3-98da-4f0aa0e88db3",
          account_age: "LESS_THAN_THIRTY_DAYS",
          account_creation_date: "2019-01-10",
          account_change_date: "2019-01-28",
          account_change_indicator: "THIS_TRANSACTION",
          account_password_change_date: "2019-01-15",
          account_password_change_indicator: "LESS_THAN_THIRTY_DAYS",
          home_phone: {
              country_code: "44",
              subscriber_number: "123456789"
          },
          work_phone: {
              country_code: "44",
              subscriber_number: "1801555888"
          },
          payment_account_creation_date: "2019-01-01",
          payment_account_age_indicator: "LESS_THAN_THIRTY_DAYS",
          suspicious_account_activity: "NO_SUSPICIOUS_ACTIVITY",
          purchases_last_6months_count: "03",
          transactions_last_24hours_count: "01",
          transaction_last_year_count: "05",
          provision_attempt_last_24hours_count: "01",
          shipping_address_time_created_reference: "2019-01-28",
          shipping_address_creation_indicator: "THIS_TRANSACTION"
      },
      payer_prior_three_ds_authentication_data: {
          authentication_method: "FRICTIONLESS_AUTHENTICATION",
          acs_transaction_reference: "26c3f619-39a4-4040-bf1f-6fd433e6d615",
          authentication_timestamp: "2020-07-28T10:26:49.712Z",
          authentication_data: "secret123"
      },
      recurring_authorization_data: {
          max_number_of_instalments: "05",
          frequency: "25",
          expiry_date: "2019-08-25"
      },
      payer_login_data: {
          authentication_data: "secret123",
          authentication_timestamp: "2020-07-28T10:26:49.712Z",
          authentication_type: "MERCHANT_SYSTEM_AUTHENTICATION"
      },
      browser_data: {
          accept_header: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
          color_depth: "TWENTY_FOUR_BITS",
          ip: "123.123.123.123",
          java_enabled: "true",
          javascript_enabled: "true",
          language: "en-US",
          screen_height: "1080",
          screen_width: "1920",
          challenge_window_size: "FULL_SCREEN",
          timezone: "0",
          user_agent: "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36"
      },
      merchant_contact_url: "https://enp4qhvjseljg.x.pipedream.net/"
    };

    var initiateResp = invokeService(initiateRequest, data );
return initiateResp;
  }
    function invokeService(params, addData ){
      var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
      var Site = require('dw/system/Site');
      var currentSite = Site.getCurrent();
      var auth_id = addData.auth_id;

    var initResp =  LocalServiceRegistry.createService('GlobalPay', {
      createRequest: function (svc, params) {
        svc.setRequestMethod('POST');
        var url = 'https://apis.sandbox.globalpay.com/ucp/authentications/'+auth_id+'/initiate';
        svc.setURL(url);//svc.getURL() + '/' + prepareEndpoint(serviceEndpoint, endpointParams));
        svc.addHeader('content-type', 'application/json');
        svc.addHeader('x-gp-version', currentSite.getCustomPreferenceValue('gp_x_gp_version'));
  
        
          svc.addHeader('Authorization', 'Bearer ' + getAccessToken());
         
        return JSON.stringify(params);
      },
      parseResponse: function (svc, response) {
        return JSON.parse(response.text);
      },
      filterLogMessage: function (msg) {
        return msg;
      }
    }).call(params);

    return initResp;
  } 

module.exports = {
    getAccessToken: getAccessToken,
    authenticate: authenticate,
    authorize: authorize,
    capture: capture,
    refund:refund,
    paypal: paypal,
    gpay:gpay,
    updateTokenUsagemode:updateTokenUsagemode,
    tokenize:tokenize,
    detokenize:detokenize,
    applePay:applePay,
    threeDsStepone:threeDsStepone,
    threeDsSteptwo:threeDsSteptwo,
    payPalCapture: payPalCapture,
    initiateRequest: initiateRequest
};