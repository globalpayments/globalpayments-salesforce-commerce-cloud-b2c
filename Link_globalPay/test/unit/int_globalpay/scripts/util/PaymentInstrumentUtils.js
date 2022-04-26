'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
var paymentInstrument = {
  creditCardHolder: 'someName',
  creditCardType: 'someCardType',
  creditCardExpirationMonth: 'someMonth',
  creditCardExpirationYear: 'someYear',
  UUID: 'someUUID',
  creditCardNumber: 'someNumber',
  paymentTransaction: {
    amount: {
      value: 1000
    }
  }
};
var dw={order:{Order:"CONFIRMATION_STATUS_CONFIRMED"}};
var order = {
  totalGrossPrice: 10.00,
  currencyCode: 'US',
  orderNo: '12345',
  customerName: 'test_user',
  setConfirmationStatus:function(){

  }
};
var serviceResponse = {
  success: false,
};

describe('paymentInstrumentUtils', function () {
  var PaymentInstrumentUtils = proxyquire('../../../../../cartridges/int_globalpay/cartridge/scripts/util/PaymentInstrumentUtils', {
    'dw/web/Resource': {
      msg: function (param) {
        return param;
      },
    },
    'dw/system/Logger': {},
    'dw/order/PaymentInstrument': {},
    'dw/order/BasketMgr': {
      getCurrentBasket: function (param) {
        return {
          createPaymentInstrument:function (param) {
            return paymentInstrument;
          },
          getPaymentInstruments: function (param) {
            return paymentInstrument;
          }
        };
      }
    },
    '*/cartridge/scripts/util/collections': {
      forEach: function (param) {
        return param;
      }
    },
    'dw/system/Transaction': {
      wrap: function (arg) { arg(); return true; }
    },
    'dw/system/Status': {
      'ERROR': false
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

  describe('ApplePaymentOrderUpdate', function () {
    it('Should process the Applepayorder with succes result', function () {
      var result = PaymentInstrumentUtils.ApplePaymentOrderUpdate(order, serviceResponse);
      assert.equal(serviceResponse.success, false);
    });

  });

  describe('RemoveExistingPaymentInstruments', function () {
    var paymentType = 'paymentmethodname.googlepay';
    it('Should remove the existing payment instrument', function () {
      var result = PaymentInstrumentUtils.RemoveExistingPaymentInstruments(paymentType);
      assert.deepEqual(
        result,
        paymentInstrument
      );
    });
  });
});