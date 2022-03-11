'use strict';

var Status = require('dw/system/Status');
var Transaction = require('dw/system/Transaction');
var ApplePayHookResult = require('dw/extensions/applepay/ApplePayHookResult');


var paymentMethodID = 'DW_APPLE_PAY';

/**
 * @function getRequest hook is called whenever there is a new request on the site
 */
 exports.getRequest = function (basket, request) {
    session.custom.applepaysession = 'yes';   // eslint-disable-line
    var status = new Status(Status.OK );
    var result = new ApplePayHookResult(status, null);
    return result;
};

exports.authorizeOrderPayment = function (order, responseData) {
    var status = Status.ERROR;
    var authResponseStatus;
    var paymentMethod = require('dw/order/PaymentMgr').getPaymentMethod(paymentMethodID);

    // eslint-disable-next-line
    Transaction.wrap(function () {
        //  lineItemCtnr.paymentInstrument field is deprecated.  Get default payment method.
        var paymentInstrument = null;
        // eslint-disable-next-line
        if (!empty(order.getPaymentInstruments())) {
            paymentInstrument = order.getPaymentInstruments()[0];
            paymentInstrument.paymentTransaction.paymentProcessor = paymentMethod.getPaymentProcessor();
        } else {
            return new Status(status);
        }
        paymentInstrument.paymentTransaction.paymentProcessor = paymentMethod.getPaymentProcessor();
    });
   
   // service logic import
  var globalpayAuthorization = require('./GP_APPLEPAY_Auth');
  var token = responseData.payment.token.paymentData;
  authResponseStatus= globalpayAuthorization.Authorize( order ,token);
    if (authResponseStatus) {
        status = Status.OK;
    }

    return new Status(status);
};
