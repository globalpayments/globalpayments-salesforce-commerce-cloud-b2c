'use strict';

/* API Includes */
var Cart = require('*/cartridge/scripts/models/CartModel');
var PaymentMgr = require('dw/order/PaymentMgr');
var Transaction = require('dw/system/Transaction');
var globalpayconstants = require('*/cartridge/scripts/constants/globalpayconstants');
var Countries = require('app_storefront_core/cartridge/scripts/util/Countries');
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
    var countryCode = Countries.getCurrent({
      CurrentRequest: {
          locale: request.locale
      }
    }).countryCode;
    var paypalData = {
      account_name: globalpayconstants.paypalData.account_name,
      channel: globalpayconstants.paypalData.channel,
      capture_mode: captureMode.value,
      type: globalpayconstants.paypalData.type,
      amount: (order.totalGrossPrice.value * 100).toFixed(),
      currency: order.currencyCode,
      reference: order.orderNo,
      country: countryCode,
      payment_method: {
        entry_mode: globalpayconstants.paypalData.entryMode,
        apm: {
          provider: globalpayconstants.paypalData.paypal
        }
      },
      notifications: {
        return_url: URLUtils.https('COPlaceOrder-PayPalReturn').toString(),
        status_url: URLUtils.https('COPlaceOrder-PayPalStatus').toString(),
        cancel_url: URLUtils.https('COPlaceOrder-PayPalCancel').toString()
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
