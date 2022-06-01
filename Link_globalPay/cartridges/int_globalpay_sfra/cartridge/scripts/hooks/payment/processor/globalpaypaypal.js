/* eslint-disable linebreak-style */
'use strict';

var Resource = require('dw/web/Resource');
var Transaction = require('dw/system/Transaction');
var globalpayconstants = require('*/cartridge/scripts/constants/globalpayconstants');
var globalPayPreferences = require('*/cartridge/scripts/helpers/globalPayPreferences');
var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelpers');
var PaymentInstrumentUtils = require('*/cartridge/scripts/util/PaymentInstrumentUtils');
/**
 * Authorizes a payment using a credit card. Customizations may use other processors and custom
 *      logic to authorize credit card payment.
 * @param {number} orderNumber - The current order's number
 * @param {dw.order.PaymentInstrument} paymentInstrument -  The payment instrument to authorize
 * @param {dw.order.PaymentProcessor} paymentProcessor -  The payment processor of the current
 *      payment method
 * @param {dw.order.Order} order - the order object
 * @return {Object} returns an error object
 */
function Authorize(orderNumber, paymentInstrument, paymentProcessor, order) {
  var URLUtils = require('dw/web/URLUtils');
  var preferences = globalPayPreferences.getPreferences();
  var captureMode = preferences.captureMode;
  var Locale = require('dw/util/Locale');
  var Site = require('dw/system/Site');
  var currentSite = Site.getCurrent();
  var paypalData = {
    account_name: globalpayconstants.paypalData.account_name,
    channel: globalpayconstants.paypalData.channel,
    capture_mode: captureMode.value,
    type: globalpayconstants.paypalData.type,
    amount: (order.totalGrossPrice.value * 100).toFixed(),
    currency: order.currencyCode,
    reference: order.orderNo,
    country: Locale.getLocale(currentSite.defaultLocale).country,
    payment_method: {
      entry_mode: globalpayconstants.paypalData.entryMode,
      apm: {
        provider: globalpayconstants.paypalData.paypal
      }
    },
    notifications: {
      return_url: URLUtils.https('GPPayPal-PayPalReturn').toString(),
      status_url: URLUtils.https('GPPayPal-PayPalStatus').toString(),
      cancel_url: URLUtils.https('GPPayPal-PayPalCancel').toString()
    }
  };
  var paypalresp = globalPayHelper.paypal(paypalData);
  var serverErrors = [];
  if (typeof paypalresp !== 'undefined' && 'success' in paypalresp && !paypalresp.success) {
    var error = true;
    if ('detailedErrorDescription' in paypalresp) { serverErrors.push(paypalresp.error.detailedErrorDescription); }
  } else {
    try {
      Transaction.wrap(function () {
        paymentInstrument.custom.gp_transactionid = paypalresp.id;
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

  return { serverErrors: serverErrors, error: error, paypalresp: paypalresp };
}

/**
 * Create the PaymentInstrument and update total price.
 * @param {dw.order.Basket} basket - The current basket
 * @param {Object} req - The request object
 * @return {Object} returns an error object
 */
function Handle(basket, req) {
  var cardErrors = {};
  var serverErrors = [];
  Transaction.wrap(function () {
    // clear previous payment instrument and update new selected payment instrument
    var paymentInstrument = PaymentInstrumentUtils.RemoveExistingPaymentInstruments(globalpayconstants.paypalData.paymentTypeCode);
  });
  return { fieldErrors: cardErrors, serverErrors: serverErrors, error: false };
}

/**
 * Capture the transaction id
 * @param {*} order
 * @returns
 */
function Capture(order) {
  var payPalCapture = {
    transactionId: order.paymentInstrument.custom.gp_transactionid
  };
  var payPalCaptureResp = globalPayHelper.payPalCapture(payPalCapture);
  return payPalCaptureResp;
}

exports.Authorize = Authorize;
exports.Handle = Handle;
exports.Capture = Capture;
