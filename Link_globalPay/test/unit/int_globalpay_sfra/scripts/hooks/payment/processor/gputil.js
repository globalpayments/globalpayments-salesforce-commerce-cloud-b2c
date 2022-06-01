'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
var son = require('../../../../../../../cartridges/int_globalpay_sfra/cartridge/scripts/utils/gputil');

var order = {
  totalGrossPrice: 10.00,
  currencyCode: 'US',
  orderNo: '12345',
  customerName: 'test_user',
  setPaymentStatus(){}
};



describe('gputil', function () {
  var gpconst = proxyquire('../../../../../../../cartridges/int_globalpay/cartridge/scripts/constants/globalpayconstants', {});
var gpUtilProcessor = proxyquire('../../../../../../../cartridges/int_globalpay_sfra/cartridge/scripts/utils/gputil', {
    'dw/system/Transaction': {
        wrap: function (arg) { arg(); return true; }
      },    
      '*/cartridge/scripts/constants/globalpayconstants': gpconst,  
      'dw/order/Order': {},
      '*/cartridge/scripts/helpers/globalPayPreferences':{
        getPreferences: function () {
          return {
              appId: 'gp_app_id',
              appKey: 'gp_app_key',
              apiVersion: 'gp_api_version',
              grantType: 'gp_grant_type',
              enableGooglepay: 'gp_enable_googlepay',
              enableApplepay: 'gp_enable_applepay',
              enablePaypal: 'gp_enable_paypal',
              captureMode: 'gp_captureMode',
              clientId: 'gp_clientID',
              env: 'gp_env',
              threedsecureChallenge: 'gp_threedsecure_challengenotification', // http://testing.test/wc-api/globalpayments_threedsecure_challengenotification/
              threedsecureMethod: 'gp_threedsecure_methodnotification', // http://testing.test/wc-api/globalpayments_threedsecure_methodnotification/
              gpayMerchantId: 'gp_gpayMerchantId',
              gpayMerchantName: 'gp_gpayMerchantName',
              gpayEnv: 'gp_gpayEnv',
              gatewayMerchantId: 'gp_gatewayMerchantId'
          }
      }
      },
      '*/cartridge/scripts/helpers/globalPayHelper':{},
      'dw/order/OrderMgr': {
        placeOrder: function (param) {
          return param;
        }
      }
});

  describe('gputil', function () {
    it('Should process the gputil with success result', function () {
      var result = gpUtilProcessor.orderUpdate(order);
    });
  });
});
