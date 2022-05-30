'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

var order = {
  totalGrossPrice: 10.00,
  currencyCode: 'US',
  orderNo: '12345',
  customerName: 'test_user',
  setConfirmationStatus(){}
};
var serviceResponse = {
  success: true
};


describe('PaymentInstrumentUtils', function () {
var paymentUtilProcessor = proxyquire('../../../../../../../cartridges/int_globalpay_sfra/cartridge/scripts/utils/PaymentInstrumentUtil', {
    'dw/system/Transaction': {
        wrap: function (arg) { arg(); return true; }
      },      
      'dw/system/Status': {
        'ERROR' :false
      },
      'dw/order/Order': {},
      'dw/order/OrderMgr': {
        placeOrder: function (param) {
          return param;
        },
        failOrder: function (param) {
          return param;
        }
      }
});

  describe('applePaymentOrderUpdate', function () {
    it('Should process the PaymentInstrumentUtils with success result', function () {
      var result = paymentUtilProcessor.applePaymentOrderUpdate(order, serviceResponse);
      assert.isTrue(result);
    });
  });
});
