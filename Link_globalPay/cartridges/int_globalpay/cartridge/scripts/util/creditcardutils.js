'use strict';
var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelpers');
var globalpayconstants = require('*/cartridge/scripts/constants/globalpayconstants');
var BasketMgr = require('dw/order/BasketMgr');
var basket = BasketMgr.getCurrentOrNewBasket();
var Locale = require('dw/util/Locale');
var URLUtils = require('dw/web/URLUtils');
var currentBasket = BasketMgr.getCurrentBasket();


/**
 * for authenticating the given pmt_token.
 * @param req -- request object
 * @param res -- resp object
 * @return Object -- authentication object
 */
function authenticationData(req, res) {
  var myreq = req.httpParameterMap.requestBodyAsString;
  var body = JSON.parse(myreq);

  var authenticationData = {
    account_name: globalpayconstants.authenticationData.account_name,
    channel: globalpayconstants.authenticationData.channel,
    country: Locale.getLocale(!empty(req.locale.id) ? req.locale.id : req.locale).country,
    reference: globalpayconstants.authorizationData.reference,
    amount: body.card.cartData.amount,
    currency: currentBasket.currencyCode,
    source: globalpayconstants.authenticationData.source,
    payment_method: {
      id: JSON.parse(myreq).card.reference
    },
    notifications: {
      challenge_return_url: URLUtils.abs('GlobalPay-ThreeDSSecureChallenge').toString(),
      three_ds_method_return_url: URLUtils.abs('GlobalPay-ThreeDsMethod').toString()
    }
  };

  var authentication = globalPayHelper.authenticate(authenticationData);
  var reqAuthfields = {};
  if (!empty(authentication) && !empty(authentication.success) && !authentication.success) {
    var serverErrors = [];
    serverErrors.push(authentication.error.detailedErrorDescription);
    reqAuthfields.error = true;
    reqAuthfields.authentication = authentication;
  }

  if(!reqAuthfields.error){
  reqAuthfields.error = false;
  reqAuthfields.enrolled = !empty(authentication.threeDs.enrolledStatus) ? authentication.threeDs.enrolledStatus : '';
  reqAuthfields.methodData = authentication.threeDs.methodData.encodedMethodData;
  reqAuthfields.methodUrl = authentication.threeDs.methodUrl;
  reqAuthfields.serverTransactionId = authentication.threeDs.serverTransRef;
  reqAuthfields.challengevalue = authentication.threeDs.challengeValue;
  reqAuthfields.acschallengerequesturl = authentication.threeDs.acsChallengeRequestUrl;
  reqAuthfields.versions = {};
  reqAuthfields.versions.accessControlServer = {};
  reqAuthfields.versions.accessControlServer.start = authentication.threeDs.acsProtocolVersionStart;
  reqAuthfields.versions.accessControlServer.end = authentication.threeDs.acsProtocolVersionEnd;
  reqAuthfields.versions.directoryServer = {};
  reqAuthfields.versions.directoryServer.start = authentication.threeDs.dsProtocolVersionStart;
  reqAuthfields.versions.directoryServer.end = authentication.threeDs.dsProtocolVersionEnd;
  reqAuthfields.id = authentication.id;
  }

  return reqAuthfields;

}

function initiationData(req, res) {
  var myreq = req.httpParameterMap.requestBodyAsString;
  var body = JSON.parse(myreq);
  var browserData = JSON.parse(myreq).browserData;
  var challengeWindow = JSON.parse(myreq).challengeWindow;
  var threeDsStepOne =
  {
    three_ds: {
      source: globalpayconstants.threeDsStepOne.source,
      preference: globalpayconstants.threeDsStepOne.preference,
    },
    auth_id: JSON.parse(myreq).authId,
    method_url_completion_status: globalpayconstants.threeDsStepOne.method_url_completion_status,
    merchant_contact_url: globalpayconstants.threeDsStepOne.merchant_contact_url,
    order: {
      time_created_reference: (new Date()).toISOString(),
      amount: body.card.cartData.amount,
      currency: basket.currencyCode,
      address_match_indicator: globalpayconstants.threeDsStepOne.address_match_indicator,
      shipping_address: {
        line1: body.card.cartData.address1,
        city: body.card.cartData.city,
        postal_code: body.card.cartData.postalcode,
        country: globalpayconstants.country
      }
    },
    payment_method: {
      id: JSON.parse(myreq).card.reference
    },

    browser_data: {
      accept_header: globalpayconstants.threeDsStepOne.accept_header,
      color_depth: browserData.colorDepth,
      ip: req.httpHeaders.get('true-client-ip'),
      java_enabled: browserData.javaEnabled,
      javascript_enabled: browserData.javascriptEnabled,
      language: browserData.language,
      screen_height: browserData.screenHeight,
      language: browserData.language,
      screen_width: browserData.screenWidth,
      challenge_window_size: challengeWindow.windowSize,
      timezone: browserData.timezoneOffset,
      user_agent: browserData.userAgent
    }
  }

  var threeDsStepOneResp = globalPayHelper.threeDsStepone(threeDsStepOne);
  var threeDSResponse = {};
  if (!empty(threeDsStepOneResp)) {
    threeDSResponse.acsTransactionId = threeDsStepOneResp.threeDs.acsTransRef;
    threeDSResponse.authenticationSource = threeDsStepOneResp.threeDs.authenticationSource;
    threeDSResponse.authenticationRequestType = threeDsStepOneResp.threeDs.messageCategory;
    threeDSResponse.cardholderResponseInfo = threeDsStepOneResp.threeDs.cardholderResponseInfo;
    threeDSResponse.challenge = {};
    threeDSResponse.challenge.encodedChallengeRequest = threeDsStepOneResp.threeDs.challengeValue;
    threeDSResponse.challenge.requestUrl = threeDsStepOneResp.threeDs.redirectUrl;
    threeDSResponse.challengeMandated = threeDsStepOneResp.threeDs.challengeStatus;
    threeDSResponse.deviceRenderOptions = threeDsStepOneResp.threeDs.authenticationSource;
    threeDSResponse.dsTransactionId = threeDsStepOneResp.threeDs.dsTransRef;
    threeDSResponse.messageCategory = threeDsStepOneResp.messageCategory;
    threeDSResponse.messageExtension = threeDsStepOneResp.threeDs.authenticationSource;
    threeDSResponse.messageVersion = threeDsStepOneResp.threeDs.messageVersion;
    threeDSResponse.mpi = {};
    threeDSResponse.mpi.authenticationValue = threeDsStepOneResp.threeDs.authenticationValue;
    threeDSResponse.mpi.eci = threeDsStepOneResp.threeDs.eci;
    threeDSResponse.serverTransactionId = threeDsStepOneResp.threeDs.serverTransRef;
    threeDSResponse.status = threeDsStepOneResp.threeDs.status;
    threeDSResponse.statusReason = threeDsStepOneResp.threeDs.statusReason;
    threeDSResponse.authID = threeDsStepOneResp.id;
  }
  return threeDSResponse;
}
//get threeD secure one card authentication status
function getAuthenticationResult(req, res) {
  var paRes = req.httpParameterMap.PaRes.value;
  var authId = req.httpParameterMap.MD.value;
  var authenticationData = {
    three_ds:
    {
      challengeResultValue: paRes
    },
    authId: authId
  }
  var authentication = globalPayHelper.getAuthenticationResult(authenticationData);
  return authentication;
}
module.exports = {
  authenticationData: authenticationData,
  initiationData: initiationData,
  getAuthenticationResult: getAuthenticationResult
};