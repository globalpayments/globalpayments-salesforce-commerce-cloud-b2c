/* eslint-disable linebreak-style */
'use strict';

var Status = require('dw/system/Status');
var server = require('server');
var Transaction = require('dw/system/Transaction');
var ApplePayHookResult = require('dw/extensions/applepay/ApplePayHookResult');
var globalpayAuthorization = require('*/cartridge/scripts/hooks/payment/globalpayApplepay');
var PaymentMgr = require('dw/order/PaymentMgr');


var paymentMethodID = 'DW_APPLE_PAY';

/**
 * @function getRequest hook is called whenever there is a new request on the site
 */
exports.getRequest = function () {
    var status;
    var result;
    session.custom.applepaysession = 'yes';   // eslint-disable-line
    status = new Status(Status.OK);
    result = new ApplePayHookResult(status, null);
    return result;
};

/**
 *
 * @param {Object} responseBillingAddress billing data from apple response
 */
function setBillingAddress(responseBillingAddress) {
    var billingForm = server.forms.getForm('billing');
    var billingAddress = {
        firstName: responseBillingAddress.givenName,
        lastName: responseBillingAddress.lastName,
        address1: responseBillingAddress.addressLines[0],
        address2: responseBillingAddress.addressLines[1] ? responseBillingAddress.addressLines[1] : '',
        city: responseBillingAddress.locality,
        stateCode: responseBillingAddress.administrativeArea,
        postalCode: responseBillingAddress.postalCode,
        country: responseBillingAddress.countryCode,
        paymentMethod: paymentMethodID
    };
    billingForm.copyFrom(billingAddress);
}

/**
 *
 * @param {Object} responseShippingAddress billing data from apple response
 */
function setShippingAddress(responseShippingAddress) {
    var shippingForm = server.forms.getForm('shipping');
    var shippingAddress = {
        firstName: responseShippingAddress.givenName,
        lastName: responseShippingAddress.lastName,
        address1: responseShippingAddress.addressLines[0],
        address2: responseShippingAddress.addressLines[1] ?
     responseShippingAddress.addressLines[1] : '',
        city: responseShippingAddress.locality,
        stateCode: responseShippingAddress.administrativeArea,
        postalCode: responseShippingAddress.postalCode,
        country: responseShippingAddress.countryCode,
        phone: responseShippingAddress.phoneNumber
    };
    shippingForm.copyFrom(shippingAddress);
}

exports.authorizeOrderPayment = function (order, responseData) {
    var status = Status.ERROR;
    var authResponseStatus;
    var paymentMethod = PaymentMgr.getPaymentMethod(paymentMethodID);
    var token;
    setBillingAddress(responseData.payment.billingContact);
    setShippingAddress(responseData.payment.shippingContact);
    // eslint-disable-next-line
    Transaction.wrap(function () {
        //  lineItemCtnr.paymentInstrument field is deprecated.  Get default payment method.
        var paymentInstrument = null;
        // eslint-disable-next-line
        if (!empty(order.getPaymentInstruments())) {
            paymentInstrument = order.getPaymentInstruments()[0];
            paymentInstrument.paymentTransaction.paymentProcessor =
           paymentMethod.getPaymentProcessor();
        } else {
            return new Status(status);
        }
        paymentInstrument.paymentTransaction.paymentProcessor = paymentMethod.getPaymentProcessor();
    });

   // service logic import
    token = responseData.payment.token.paymentData;
    authResponseStatus = globalpayAuthorization.authorize(order, token);
    if (authResponseStatus) {
        status = Status.OK;
    }

    return new Status(status);
};
