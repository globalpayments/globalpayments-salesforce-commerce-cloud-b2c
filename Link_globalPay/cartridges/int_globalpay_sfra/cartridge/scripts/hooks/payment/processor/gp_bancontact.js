/* eslint-disable no-param-reassign */
/* eslint-disable linebreak-style */
'use strict';

var Resource = require('dw/web/Resource');
var Transaction = require('dw/system/Transaction');
var globalpayconstants = require('*/cartridge/scripts/constants/globalPayConstant');
var globalPayPreferences = require('*/cartridge/scripts/helpers/globalPayPreferences');
var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelpers');
var PaymentInstrumentUtils = require('*/cartridge/scripts/util/paymentInstrumentUtils');
var URLUtils = require('dw/web/URLUtils');
var Locale = require('dw/util/Locale');

/**
 * Authorizes a payment using a credit card.
 * Customizations may use other processors and custom
 * logic to authorize credit card payment.
 * @param {number} orderNumber - The current order's number
 * @param {dw.order.PaymentInstrument} paymentInstrument -  The payment instrument to authorize
 * @param {dw.order.PaymentProcessor} paymentProcessor -  The payment processor of the current
 *      payment method
 * @param {dw.order.Order} order - the order object
 * @return {Object} returns an error object
 */
function Authorize(orderNumber, paymentInstrument, paymentProcessor, order) {
    var preferences = globalPayPreferences.getPreferences();
    var captureMode = preferences.captureMode;

    var error;
    var lpmData = {
        account_name: globalpayconstants.localPayment.account_name,
        channel: globalpayconstants.localPayment.channel,
        capture_mode: captureMode.value,
        type: globalpayconstants.localPayment.type,
        amount: (order.totalGrossPrice.value * 100).toFixed(),
        currency: order.currencyCode,
        reference: order.orderNo,
        country: Locale.getLocale(order.customerLocaleID).country,
        payment_method: {
            entry_mode: globalpayconstants.localPayment.entryMode,
            apm: {
                provider: globalpayconstants.banContactPay.provider
            }
        },
        notifications: {
            return_url: URLUtils.https('GlobalPayLpm-LpmReturn').toString(),
            status_url: URLUtils.https('GlobalPayLpm-LpmStatus').toString()
        }
    };
    var lpmresp = globalPayHelper.lpm(lpmData);
    var serverErrors = [];
    if (typeof lpmresp !== 'undefined' && 'success' in lpmresp && !lpmresp.success) {
        error = true;
        if ('detailedErrorDescription' in lpmresp) {
            serverErrors.push(lpmresp.error.detailedErrorDescription);
        }
    } else {
        try {
            Transaction.wrap(function () {
                paymentInstrument.custom.gp_transactionid = lpmresp.id;
                paymentInstrument.paymentTransaction.setTransactionID(orderNumber);
                paymentInstrument.paymentTransaction.setPaymentProcessor(paymentProcessor);
            });
        } catch (e) {
            error = true;
            serverErrors.push(
                        Resource.msg('error.technical', 'checkout', null)
                    );
        }
    }

    return {serverErrors: serverErrors, error: error, lpmresp: lpmresp};
}

/**
 * Create the PaymentInstrument and update total price.
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
      globalpayconstants.banContactPay.paymentTypeCode);
    });
    return {fieldErrors: cardErrors, serverErrors: serverErrors, error: false};
}

/**
 * Capture the transaction id
 * @param {*} order
 * @returns
 */
function Capture(order) {
    var payPalCapture = {
        transactionId: order.paymentInstruments.length > 0 ? order.paymentInstruments[0].custom.gp_transactionid : ''
    };
    var payPalCaptureResp = globalPayHelper.payPalCapture(payPalCapture);
    return payPalCaptureResp;
}

exports.Authorize = Authorize;
exports.Handle = Handle;
exports.Capture = Capture;