'use strict';

/* API Includes */
var Cart = require('*/cartridge/scripts/models/CartModel');
var PaymentMgr = require('dw/order/PaymentMgr');
var Transaction = require('dw/system/Transaction');
var globalpayconstants = require('*/cartridge/scripts/constants/globalpayconstants');
var Resource = require('dw/web/Resource');
var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
/**
 * This is where additional PayPal integration would go. The current implementation simply creates a PaymentInstrument and
 * returns 'success'.
 */
function Handle(args) {
    var cart = Cart.get(args.Basket);

    Transaction.wrap(function () {
        cart.removeExistingPaymentInstruments(globalpayconstants.paypalData.paymentTypeCode);
        cart.createPaymentInstrument(globalpayconstants.paypalData.paymentTypeCode, cart.getNonGiftCertificateAmount());
    });

    return {success: true};
}

/**
 * Authorizes a payment using apaypal. The payment is authorized by using the PAYPAL_EXPRESS processor only
 * and setting the order no as the transaction ID. Customizations may use other processors and custom logic to
 * authorize payment.
 */
 function Authorize(args) {
    var orderNo = args.OrderNo;
    var paymentInstrument = args.PaymentInstrument;
    var paymentProcessor = PaymentMgr.getPaymentMethod(paymentInstrument.getPaymentMethod()).getPaymentProcessor();
    
    var order=args.Order;
    var globalpayconstants = require('*/cartridge/scripts/constants/globalpayconstants');
    var globalPayPreferences = require('*/cartridge/scripts/helpers/globalPayPreferences');
    var URLUtils = require('dw/web/URLUtils');
    var preferences = globalPayPreferences.getPreferences();
    var captureMode = preferences.captureMode;
    var Locale = require('dw/util/Locale');
    var paypalData = {
      account_name: globalpayconstants.paypalData.account_name,
      channel: globalpayconstants.paypalData.channel,
      capture_mode: captureMode.value,
      type: globalpayconstants.paypalData.type,
      amount: (order.totalGrossPrice.value * 100).toFixed(),
      currency: order.currencyCode,
      reference: order.orderNo,
      country: 'US',
     // country:Locale.getLocale(request.locale.id).country, need
      payment_method: {
        entry_mode: globalpayconstants.paypalData.entryMode,
        apm: {
          provider: globalpayconstants.paypalData.paypal
        }
      },
      notifications: {
        return_url: URLUtils.https('COPlaceOrder-PayPalReturn').toString(), // "https://zzkf-006.sandbox.us01.dx.commercecloud.salesforce.com/on/demandware.store/Sites-RefArch-Site/en_US/GPPayPal-PayPalReturn",
        status_url: URLUtils.https('COPlaceOrder-PayPalStatus').toString(), // "https://zzkf-006.sandbox.us01.dx.commercecloud.salesforce.com/on/demandware.store/Sites-RefArch-Site/en_US/GPPayPal-PayPalStatus",
        cancel_url: URLUtils.https('COPlaceOrder-PayPalCancel').toString() // "https://zzkf-006.sandbox.us01.dx.commercecloud.salesforce.com/on/demandware.store/Sites-RefArch-Site/en_US/GPPayPal-PayPalCancel"
      }
    };
    var paypalresp = globalPayHelper.paypal(paypalData);
    var serverErrors = [];
    if (!empty(paypalresp) && 'success' in paypalresp && !paypalresp.success) {
      var error = true;
      if ('detailedErrorDescription' in authorization) { serverErrors.push(authorization.error.detailedErrorDescription); }
    } else {
      try {
        Transaction.wrap(function () {
          paymentInstrument.custom.gp_transactionid = paypalresp.id;
          paymentInstrument.paymentTransaction.setTransactionID(args.OrderNo);
          paymentInstrument.paymentTransaction.setPaymentProcessor(paymentProcessor);
        });
      } catch (e) {
        error = true;
        serverErrors.push(
                          Resource.msg('error.technical', 'checkout', null)
                      );
      }
    }

  
    return {authorized: true,serverErrors: serverErrors, error: error,  paypalresp: paypalresp };
}


function Capture(order){
  var payPalCapture = {
    "transactionId":order.paymentInstrument.custom.gp_transactionid
  }
  var payPalCaptureResp = globalPayHelper.payPalCapture(payPalCapture); 
  return payPalCaptureResp;
}

/*
 * Module exports
 */

/*
 * Local methods
 */
exports.Handle = Handle;
exports.Authorize = Authorize;
exports.Capture = Capture;
