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
        cart.removeExistingPaymentInstruments(globalpayconstants.applePay.paymentTypeCode);
        cart.createPaymentInstrument(globalpayconstants.applePay.paymentTypeCode, cart.getNonGiftCertificateAmount());
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
    var applePayData = {
        account_name: globalpayconstants.applePay.account_name,
        channel: globalpayconstants.applePay.channel,
        type:globalpayconstants.applePay.type,
        capture_mode: captureMode.value,
        amount: order.totalGrossPrice.value * 100,
        currency: order.currencyCode,
        reference: order.orderNo,
        country:  'US',
        payment_method: {
            name: order.customerName,
            entry_mode: globalpayconstants.applePay.entryMode,
            digital_wallet: {
                provider: globalpayconstants.applePay.provider,
                //need to be removed once we get the solution for payment token
                tokenFormat: "CARD_NUMBER",
                expiryMonth: "12",
                expiryYear: "25",
                cryptogram: "234234234",
                token: "5167300431085507",
                eci: "3",
                // payment_token: {
                //     version: "EC_v1",
                //     data: "Ft+dvMNzlcy6WNB+zerKtkh/RWW4RWW4yXIRgmM3WC/FYEC6Z+OJEzir2sDyzDkjIUJ0TFCQd/QAAAAAAAA==",
                //     header: {
                //         ephemeralPublicKey: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEWdNhNAHy9kO2Kol33kIh7k6wh6E/lxriM46MR1FUrn7SHugprkaeFmWKZPgGpWgZ+telY/G1+YSoaCbR5YSoaCbR57bdGA==",
                //         transactionId: "fd88874954acdb299c285f95a3202ad1f330d3fd4ebc22a864398684198644c3",
                //         publicKeyHash: "h7WnNVz2gmpTSkHqETOWsskFPLSj31e3sPTS2cBxgrk="
                //     }
                // }  
            }
        }
    }
    var paymentInstrument = args.PaymentInstrument;
    var paymentProcessor = PaymentMgr.getPaymentMethod(paymentInstrument.getPaymentMethod()).getPaymentProcessor();

    var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
    var applePayresp = globalPayHelper.applePay(applePayData);
    var serverErrors = [];
    if(empty(applePayresp)){
        var error = true;
        if('detailedErrorDescription' in authorization)
        {serverErrors.push(authorization.error.detailedErrorDescription);}
    } else {
        try {
            Transaction.wrap(function () {
                paymentInstrument.custom.gp_transactionid = applePayresp.id;
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

return { serverErrors: serverErrors, error: error, applePayresp : applePayresp };
}

/*
 * Module exports
 */

/*
 * Local methods
 */
exports.Handle = Handle;
exports.Authorize = Authorize;
