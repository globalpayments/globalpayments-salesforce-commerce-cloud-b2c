/* eslint-disable linebreak-style */
/* eslint-disable global-require */
'use strict';

/**
 * @namespace Checkout
 */

var page = module.superModule;
var server = require('server');
server.extend(page);
server.append('Begin', server.middleware.https, function (req, res, next) {
  var globalPayPreferences = require('*/cartridge/scripts/helpers/globalPayPreferences');
  var globalPayConstant = require('*/cartridge/scripts/constants/globalPayConstant');
  var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelpers');
  var gpayToken = globalPayHelper.getCheckoutToken();
  var BasketMgr = require('dw/order/BasketMgr');
  var currentBasket = BasketMgr.getCurrentBasket();
  var Locale = require('dw/util/Locale');
  var preferences = globalPayPreferences.getPreferences();
  var env = preferences.env;
  var gpayMerchantId = preferences.gpayMerchantId;
  var gpayMerchantName = preferences.gpayMerchantName;
  var gatewayMerchantId = preferences.gatewayMerchantId;
  var gpayEnv = preferences.gpayEnv;
  var ArrayList = require('dw/util/ArrayList');
  var Site = require('dw/system/Site');
  var walletList = new ArrayList();
  var isSandbox = 'false';
  var viewData;
  var walletJson = {};
  var tokenJson = {};
  var wallet;
  var isTestEnv = Site.getCurrent().getCustomPreferenceValue('gp_env');
  if (isTestEnv.value === 'sandbox') {
    isSandbox = 'true';
  }

    // check if profile exists
  // eslint-disable-next-line no-undef
  if (!empty(customer.profile)) {
    wallet = require('dw/customer/CustomerMgr').getCustomerByCustomerNumber(customer.profile.customerNo).getProfile().getWallet();
    
    walletJson.pmt = [];
    // eslint-disable-next-line vars-on-top
    for (var c = 0; c < wallet.paymentInstruments.length; c++) {
      tokenJson = {};
      tokenJson.maskCard = wallet.paymentInstruments[c].maskedCreditCardNumber;
      tokenJson.uuid = wallet.paymentInstruments[c].UUID;
      tokenJson.pmttoken = wallet.paymentInstruments[c].creditCardToken;
      walletJson.pmt.push(tokenJson);
      walletList.add(tokenJson);
    }
  }
  viewData = res.getViewData();
  viewData = {
    token: gpayToken,
    env: env,
    currency: currentBasket.currencyCode,
    country: Locale.getLocale(req.locale.id).country,
    gpaymerchantid: gpayMerchantId,
    gpaymerchantname: gpayMerchantName,
    gatewayMerchantId: gatewayMerchantId,
    gpayenv: gpayEnv,
    myWallet: walletList,
    walletJson: walletJson,
    error: !!(req.httpParameterMap.payerAuthError
      != null && req.httpParameterMap.payerAuthError != ''),
    errorMsg: req.httpParameterMap.payerAuthError,
    isSandbox: isSandbox,
    eciData: globalPayConstant.eciData
  };
  res.setViewData(viewData);
  next();
});
module.exports = server.exports();
