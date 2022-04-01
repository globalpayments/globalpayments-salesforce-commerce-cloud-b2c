'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

var order = {
    totalGrossPrice: 10.00,
    currencyCode: 'US',
    orderNo: '12345',
    customerName: 'test_user'
};
 var serviceResponse = {
    Success : true,
 };

describe('paymentInstrumentUtils', function () {
    var PaymentInstrumentUtils = proxyquire('../../../../../cartridges/int_globalpay/cartridge/scripts/util/PaymentInstrumentUtils', {
        'dw/web/Resource' : {
            msg: function (param) {
                return param;
              },
        },
        'dw/system/Logger' : {},
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

describe('ApplePaymentOrderUpdate', function () {
     it('Should process the Applepayorder with succes result', function () {
        var result = PaymentInstrumentUtils.ApplePaymentOrderUpdate(order, serviceResponse);
        assert.equal(serviceResponse.Success, true);
    });

});
});