/* eslint-disable linebreak-style */
'use strict';
var Resource = require('dw/web/Resource');
var Transaction = require('dw/system/Transaction');
var server = require('server');
var globalpayconstants = require('*/cartridge/scripts/constants/globalPayConstant');
var globalPayPreferences = require('*/cartridge/scripts/helpers/globalPayPreferences');
var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelpers');
var PaymentInstrumentUtils = require('*/cartridge/scripts/util/paymentInstrumentUtils');
var Locale = require('dw/util/Locale');
var Site = require('dw/system/Site');
/**
 * Authorizes a payment using a credit card. Customizations may use other processors and custom
 *      logic to authorize credit card payment.
 * @param {number} orderNumber - The current order's number
 * @param {dw.order.PaymentInstrument} paymentInstrument -  The payment instrument to authorize
 * @param {dw.order.PaymentProcessor} paymentProcessor -  The payment processor of the current
 * payment method
 * @param {dw.order.Order} order - the order object
 * @return {Object} returns an error object
 */
function Authorize(orderNumber, paymentInstrument, paymentProcessor, order) {
    var preferences = globalPayPreferences.getPreferences();
    var captureMode = preferences.captureMode;
    var paymentForm = server.forms.getForm('billing');
    var token = JSON.parse(paymentForm.creditCardFields.paymentToken.htmlValue);
    var currentSite = Site.getCurrent();
    var error = true;
    var googlePayData = {
        account_name: globalpayconstants.googlePay.account_name,
        channel: globalpayconstants.googlePay.channel,
        type: globalpayconstants.googlePay.type,
        capture_mode: captureMode.value,
        amount: Math.ceil(order.totalGrossPrice.value * 100),
        currency: order.currencyCode,
        reference: order.orderNo,
        country: Locale.getLocale(currentSite.defaultLocale).country,
        payment_method: {
            name: order.customerName,
            entry_mode: globalpayconstants.googlePay.entryMode,
            digital_wallet: {
                provider: globalpayconstants.googlePay.provider,
                payment_token: {
                    signature: token.signature,
                    protocolVersion: token.protocolVersion,
                    signedMessage: token.signedMessage
                }
            }
        }
    };

    var googlePayresp = globalPayHelper.gpay(googlePayData);
    var serverErrors = [];
    if (typeof googlePayresp !== 'undefined' && 'status' in googlePayresp &&
  (googlePayresp.status !== globalpayconstants.googlePay.captureStatus
    && googlePayresp.status !== globalpayconstants.googlePay.authorizedStatus)) {
        error = true;
        if ('payment_method' in googlePayresp) {serverErrors.push(googlePayresp.message);}
    } else {
        try {
            error = false;
            Transaction.wrap(function () {
        // eslint-disable-next-line no-param-reassign
                paymentInstrument.custom.gp_transactionid = googlePayresp.id;
                paymentInstrument.paymentTransaction.setTransactionID(orderNumber);
                paymentInstrument.paymentTransaction.setPaymentProcessor(paymentProcessor);
            });
        } catch (e) {
            error = true;
            serverErrors.push(Resource.msg('error.technical', 'checkout', null));
        }
    }

    return {serverErrors: serverErrors, error: error, googlePayresp: googlePayresp};
}

/**
 *Create the PaymentInstrument and update total price
 * @param {dw.order.Basket} basket - The current basket
 * @param {Object} req - The request object
 * @return {Object} returns an error object
 */
function Handle() {
    var cardErrors = {};
    var serverErrors = [];
    Transaction.wrap(function () {
    // clear previous payment instrument and update new selected payment instrument
        PaymentInstrumentUtils.removeExistingPaymentInstruments(
      Resource.msg('paymentmethodname.googlepay', 'globalpay', null));
    });
    return {fieldErrors: cardErrors, serverErrors: serverErrors, error: false};
}


exports.Authorize = Authorize;
exports.Handle = Handle;
