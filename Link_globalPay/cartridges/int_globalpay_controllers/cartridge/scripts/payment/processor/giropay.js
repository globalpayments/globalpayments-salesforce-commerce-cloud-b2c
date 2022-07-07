'use strict';

/* API Includes */
var Cart = require('*/cartridge/scripts/models/CartModel');
var PaymentMgr = require('dw/order/PaymentMgr');
var Transaction = require('dw/system/Transaction');
var globalpayconstants = require('*/cartridge/scripts/constants/globalPayConstant');
var Countries = require('app_storefront_core/cartridge/scripts/util/Countries');
var Resource = require('dw/web/Resource');
var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelpers');
var URLUtils = require('dw/web/URLUtils');
/**
 * This is where additional giroPay integration would go.
 * The current implementation simply creates a PaymentInstrument and
 * returns 'success'.
 */
function Handle(args) {
    var cart = Cart.get(args.Basket);

    Transaction.wrap(function () {
        cart.removeExistingPaymentInstruments(globalpayconstants.giroPay.paymentTypeCode);
        cart.createPaymentInstrument(globalpayconstants.giroPay.paymentTypeCode, cart.getNonGiftCertificateAmount());
    });

    return {success: true};
}

/**
 * Authorizes a payment using giroPay. The payment is authorized by using the giroPay
 * and setting the order no as the transaction ID.
 * Customizations may use other processors and custom logic to
 * authorize payment.
 */
function Authorize(args) {
    var paymentInstrument = args.PaymentInstrument;
    var paymentProcessor = PaymentMgr.getPaymentMethod(paymentInstrument.getPaymentMethod()).getPaymentProcessor();

    var order = args.Order;
    var countryCode = Countries.getCurrent({
        CurrentRequest: {
            locale: request.locale
        }
    }).countryCode;
    var lpmData = {
        account_name: globalpayconstants.giroPay.account_name,
        type: globalpayconstants.giroPay.type,
        channel: globalpayconstants.giroPay.channel,
        amount: (order.totalGrossPrice.value * 100).toFixed(),
        currency: order.currencyCode,
        reference: order.orderNo,
        country: countryCode,
        payment_method: {
            entry_mode: globalpayconstants.giroPay.entryMode,
            apm: {
                provider: globalpayconstants.giroPay.provider
            }
        },
        notifications: {

            return_url: URLUtils.https('COPlaceOrder-LpmReturn').toString(),
            status_url: URLUtils.https('COPlaceOrder-LpmStatus').toString()
        }
    };
    var lpmresp = globalPayHelper.lpm(lpmData);
    var serverErrors = [];
    if (!empty(lpmresp) && 'success' in lpmresp && !lpmresp.success) {
        var error = true;
        if ('detailedErrorDescription' in lpmresp) {serverErrors.push(lpmresp.error.detailedErrorDescription);}
    } else {
        try {
            Transaction.wrap(function () {
                paymentInstrument.custom.gp_transactionid = lpmresp.id;
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


    return {authorized: true, serverErrors: serverErrors, error: error, lpmresp: lpmresp};
}


function Capture(order) {
    var payPalCapture = {
        transactionId: order.paymentInstrument.custom.gp_transactionid
    };
    var payPalCaptureResp = globalPayHelper.payPalCapture(payPalCapture);
    return payPalCaptureResp;
}

/*
 * Module exports
 */
exports.Handle = Handle;
exports.Authorize = Authorize;
exports.Capture = Capture;
