'use strict';

/* API Includes */
var Cart = require('*/cartridge/scripts/models/CartModel');
var PaymentMgr = require('dw/order/PaymentMgr');
var Transaction = require('dw/system/Transaction');
var Resource = require('dw/web/Resource');
var globalpayconstants = require('*/cartridge/scripts/constants/globalpayconstants');
/**
 * This is where additional PayPal integration would go. The current implementation simply creates a PaymentInstrument and
 * returns 'success'.
 */
function Handle(args) {
    var cart = Cart.get(args.Basket);

    Transaction.wrap(function () {
        cart.removeExistingPaymentInstruments(globalpayconstants.googlePay.paymentTypeCode);
        cart.createPaymentInstrument(globalpayconstants.googlePay.paymentTypeCode, cart.getNonGiftCertificateAmount());
    });

    return {success: true};
}

/**
 * Authorizes a payment using a credit card. The payment is authorized by using the PAYPAL_EXPRESS processor only
 * and setting the order no as the transaction ID. Customizations may use other processors and custom logic to
 * authorize credit card payment.
 */
 function Authorize(args) {
    var order=args.Order;
    var globalpayconstants = require('*/cartridge/scripts/constants/globalpayconstants');
    var globalPayPreferences = require('*/cartridge/scripts/helpers/globalPayPreferences');
    var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
    var URLUtils = require('dw/web/URLUtils');
    var preferences = globalPayPreferences.getPreferences();
    var captureMode = preferences.captureMode;
    var HookManager = require('dw/system/HookMgr');
    var Locale = require('dw/util/Locale');
    // var paymentForm = server.forms.getForm('billing');
    // var token = JSON.parse(paymentForm.creditCardFields.paymentToken.htmlValue);
    // var signedMessage = JSON.parse(token.signedMessage);
    var googlePayData = {
      account_name: globalpayconstants.googlePay.account_name,
      channel: globalpayconstants.googlePay.channel,
      type: globalpayconstants.googlePay.type,
      capture_mode: captureMode.value,
      amount: order.totalGrossPrice.value * 100,
      currency: order.currencyCode,
      reference: order.orderNo,
      country: 'US',
     // country:Locale.getLocale(request.locale.id).country, need to changes
      payment_method: {
        name: order.customerName,
        entry_mode: globalpayconstants.googlePay.entryMode,
        digital_wallet: {
            provider: globalpayconstants.googlePay.provider,
            tokenFormat: 'CARD_NUMBER',
            expiryMonth: '12',
            expiryYear: '25',
            cryptogram: '234234234',
            token: '5167300431085507',
            eci: '3'
          }
      }
    };
    var paymentInstrument = args.PaymentInstrument;
    var paymentProcessor = PaymentMgr.getPaymentMethod(paymentInstrument.getPaymentMethod()).getPaymentProcessor();

    var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
    var googlePayresp = globalPayHelper.gpay(googlePayData);
    var serverErrors = [];
    if (!empty(googlePayresp) && 'success' in googlePayresp && !googlePayresp.success) {
      var error = true;
      if ('detailedErrorDescription' in authorization) { serverErrors.push(authorization.error.detailedErrorDescription); }
    } else {
      try {
        Transaction.wrap(function () {
          paymentInstrument.custom.gp_transactionid = googlePayresp.id;
          paymentInstrument.paymentTransaction.transactionID=args.OrderNo;
          paymentInstrument.paymentTransaction.paymentProcessor=paymentProcessor;
        });
      } catch (e) {
        error = true;
        serverErrors.push(
                          Resource.msg('error.technical', 'checkout', null)
                      );
      }
    }
  
    return {authorized: true, serverErrors: serverErrors, error: error, googlePayresp: googlePayresp };
  }

/*
 * Module exports
 */

/*
 * Local methods
 */
exports.Handle = Handle;
exports.Authorize = Authorize;
