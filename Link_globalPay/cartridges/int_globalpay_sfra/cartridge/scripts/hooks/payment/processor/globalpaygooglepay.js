'use strict';
var collections = require('*/cartridge/scripts/util/collections');
var Resource = require('dw/web/Resource');
var Transaction = require('dw/system/Transaction');
var server = require('server');
var StringUtils = require('dw/util/StringUtils');
/**
 * Authorizes a payment using a credit card. Customizations may use other processors and custom
 *      logic to authorize credit card payment.
 * @param {number} orderNumber - The current order's number
 * @param {dw.order.PaymentInstrument} paymentInstrument -  The payment instrument to authorize
 * @param {dw.order.PaymentProcessor} paymentProcessor -  The payment processor of the current
 *      payment method
 * @return {Object} returns an error object
 */
function Authorize(orderNumber, paymentInstrument, paymentProcessor, req, order) {
  var globalpayconstants = require('*/cartridge/scripts/constants/globalpayconstants');
  var globalPayPreferences = require('*/cartridge/scripts/helpers/globalPayPreferences');
  var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
  var preferences = globalPayPreferences.getPreferences();
  var captureMode = preferences.captureMode;
  var Locale = require('dw/util/Locale');
  var paymentForm = server.forms.getForm('billing');
  var token = JSON.parse(paymentForm.creditCardFields.paymentToken.htmlValue);
  var googlePayData = {
    account_name: globalpayconstants.googlePay.account_name,
    channel: globalpayconstants.googlePay.channel,
    type: globalpayconstants.googlePay.type,
    capture_mode: captureMode.value,
    amount: order.totalGrossPrice.value * 100,
    currency: order.currencyCode,
    reference: order.orderNo,
    country: Locale.getLocale(req.locale.id).country,
    payment_method: {
      name: order.customerName,
      entry_mode: globalpayconstants.googlePay.entryMode,
      digital_wallet: {
        provider: globalpayconstants.googlePay.provider,
        payment_token: {
          signature:token.signature,
          protocolVersion:token.protocolVersion,
          signedMessage:token.signedMessage
       } 
      }
    }
  };

  var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
  var googlePayresp = globalPayHelper.gpay(googlePayData);
  var serverErrors = [];
  if (!empty(googlePayresp) && 'status' in googlePayresp &&(googlePayresp.status!= globalpayconstants.googlePay.captureStatus&&googlePayresp.status!= globalpayconstants.googlePay.authorizedStatus)) {
    var error = true;
    if ('payment_method' in googlePayresp) { serverErrors.push(googlePayresp.message); }
  } else {
    try {
      Transaction.wrap(function () {
        paymentInstrument.custom.gp_transactionid = googlePayresp.id;
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

  return { serverErrors: serverErrors, error: error, googlePayresp: googlePayresp };
}

/**
 * Authorizes a payment using a google pay. Customizations may use other processors and custom
 *      logic to authorize google pay payment.
 * @param {dw.order.Basket} basket - The current basket
 * @param {Object} req - The request object
 * @return {Object} returns an error object
 */
function Handle(basket, req) {
  var currentBasket = basket;
  var cardErrors = {};
  var Locale = require('dw/util/Locale');
  var Resource = require('dw/web/Resource');
  var serverErrors = [];
  Transaction.wrap(function () {
    var paymentInstruments = currentBasket.getPaymentInstruments(
            Resource.msg('paymentmethodname.googlepay', 'globalpay', null)
        );
    collections.forEach(paymentInstruments, function (item) {
      currentBasket.removePaymentInstrument(item);
    });

    var paymentInstrument = currentBasket.createPaymentInstrument(
            Resource.msg('paymentmethodname.googlepay', 'globalpay', null), currentBasket.totalGrossPrice
        );
  });
  return { fieldErrors: cardErrors, serverErrors: serverErrors, error: false };
}


exports.Authorize = Authorize;
exports.Handle = Handle;
