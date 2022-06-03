'use strict';

/* API Includes */
var Cart = require('*/cartridge/scripts/models/CartModel');
var PaymentMgr = require('dw/order/PaymentMgr');
var Transaction = require('dw/system/Transaction');
var Resource = require('dw/web/Resource');
var globalpayconstants = require('*/cartridge/scripts/constants/globalPayConstant');
var Countries = require('app_storefront_core/cartridge/scripts/util/Countries');
var gpapp = require(globalpayconstants.GPAPP);
var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelpers');
var globalPayPreferences = require('*/cartridge/scripts/helpers/globalPayPreferences');
/**
 * This is where additional googlepay integration would go.
 * The current implementation simply creates a PaymentInstrument and
 * returns 'success'.
 */
function Handle(args) {
  var cart = Cart.get(args.Basket);

  Transaction.wrap(function () {
    cart.removeExistingPaymentInstruments(globalpayconstants.googlePay.paymentTypeCode);
    cart.createPaymentInstrument(globalpayconstants.googlePay.paymentTypeCode, cart.getNonGiftCertificateAmount());
  });

  return { success: true };
}

/**
 * Authorizes a payment using a googlepay. The payment is authorized by using
 * the Gaagle_pay processor only and setting the order no as the transaction ID.
 * Customizations may use other processors and custom logic to authorize payment.
 */
function Authorize(args) {
  var order = args.Order;
  var preferences = globalPayPreferences.getPreferences();
  var captureMode = preferences.captureMode;

  var countryCode = Countries.getCurrent({
    CurrentRequest: {
      locale: request.locale
    }
  }).countryCode;

  var creditCardFields = gpapp.getForm('billing.paymentMethods.creditCard');
  var token = creditCardFields.get('paymentToken').value() ? JSON.parse(creditCardFields.get('paymentToken').value()) : '';
  var googlePayData = {
    account_name: globalpayconstants.googlePay.account_name,
    channel: globalpayconstants.googlePay.channel,
    type: globalpayconstants.googlePay.type,
    capture_mode: captureMode.value,
    amount: (order.totalGrossPrice.value * 100).toFixed(),
    currency: order.currencyCode,
    reference: order.orderNo,
    country: countryCode,
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
  var paymentInstrument = args.PaymentInstrument;
  var paymentProcessor = PaymentMgr.getPaymentMethod(paymentInstrument.getPaymentMethod()).getPaymentProcessor();
  var googlePayresp = globalPayHelper.gpay(googlePayData);
  var serverErrors = [];
  if (!empty(googlePayresp) && 'status' in googlePayresp && (googlePayresp.status !== globalpayconstants.googlePay.captureStatus && googlePayresp.status !== globalpayconstants.googlePay.authorizedStatus)) {
    var error = true;
    if ('payment_method' in googlePayresp) { serverErrors.push(googlePayresp.message); }
  } else {
    try {
      Transaction.wrap(function () {
        paymentInstrument.custom.gp_transactionid = googlePayresp.id;
        paymentInstrument.paymentTransaction.transactionID = args.OrderNo;
        paymentInstrument.paymentTransaction.paymentProcessor = paymentProcessor;
      });
    } catch (e) {
      error = true;
      serverErrors.push(
                          Resource.msg('error.technical', 'checkout', null)
                      );
    }
  }

  return { authorized: true,
    serverErrors: serverErrors,
    error: error,
    googlePayresp: googlePayresp };
}

/*
 * Module exports
 */
exports.Handle = Handle;
exports.Authorize = Authorize;
