'use strict';
var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
var collections = require('*/cartridge/scripts/util/collections');
var PaymentInstrument = require('dw/order/PaymentInstrument');
var PaymentMgr = require('dw/order/PaymentMgr');
var PaymentStatusCodes = require('dw/order/PaymentStatusCodes');
var Resource = require('dw/web/Resource');
var Transaction = require('dw/system/Transaction');
var globalpayconstants = require('*/cartridge/scripts/constants/globalpayconstants');

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
            var URLUtils = require('dw/web/URLUtils');
            var preferences = globalPayPreferences.getPreferences();
            var captureMode = preferences.captureMode;
            var HookManager = require('dw/system/HookMgr');
            var Locale = require('dw/util/Locale');
            var googlePayData = {
                account_name: globalpayconstants.googlePay.account_name,
                channel: globalpayconstants.googlePay.channel,
                type:globalpayconstants.googlePay.type,
                capture_mode: captureMode.value,
                amount: order.merchandizeTotalGrossPrice.value * 100,
                currency: order.currencyCode,
                reference: order.orderNo,
                country:  order.customerLocaleID,
                payment_method: {
                    name: order.customerName,
                    entry_mode: globalpayconstants.googlePay.entryMode,
                    digital_wallet: {
                        provider: globalpayconstants.googlePay.provider,
                        payment_token: {
                            signature:"MEYCIQCkQmlhYa14X6r8Yf9F/8DpMKecNtCQNx2uVIHJbqVRtgIhANkmAHzlVUdj5N5gB4AqHxR4V+j7a1affcI9AbfFAi/e",
                            protocolVersion:"ECv1",
                            signedMessage:{
                                encryptedMessage:"isSBYRDyuzHGg//8nHIDVC6gKzSpG+h9oGy/YpZ2qj6my61YVHRXgT4SK5NkkBt3jaZQwN+CDHHI4kuGEYLThbE+derWHc72YtDYNyluNAOkZcUG5xUtUP5Hx839i5NKLA4XW6Kc45LCJaAu5B38G3k8Z9OdHfam4Su9nvuald498PO6TcRvzniUlWEA4lGjKb2Yw6SRf0uQcvKaM95dspW1oyIb+raLYvKLiQt+qdhZA8yhSM0YpW7U0Ezz6Ho1t9SOKQrq/vmT/IHmroa3pt3u6N+FOgNmcuVYLFwi+IZvh8w7ybv/gBfzugVs4S+5f9ESg+bA/TV9BKR8Fxh9UW0P6rPX3nn5A9C83orPuFxJgYPp73T/JpkGAUVN4jKt2xZbOFJIQIhndiN4qJyCzVDWYaITRzsdxsvdiBzwpqPepb4g41U7UPHsU6m1SMrKOTwiiNIwhwAbbSOrX37lNRjvZxupJKQcFpUo","ephemeralPublicKey":"BAtnZTHIOqZLdvdGP+blshoSXSnXgq9lJ29jLeGL1bMrmIa1Nbt4Pqyj8KjQpamQ5BIKgwBd6AOhYIV7hvgl/AI\\u003d",
                                tag:"EP8cC6haHis2KDqkWH2br3bTu3YMseVIRg1kCzrqJ9A\\u003d"
                            }
                        }  
                    }
                }
            }
            
            var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
            var googlePayresp = globalPayHelper.gpay(googlePayData);
            var serverErrors = [];
            if(!empty(googlePayresp) && 'success' in  googlePayresp && !googlePayresp.success){
                var error = true;
                if('detailedErrorDescription' in authorization)
                serverErrors.push(authorization.error.detailedErrorDescription);
            } else {
                try {
                    Transaction.wrap(function () {
                        paymentInstrument.custom.gp_transactionid = googlePayresp.response.id;
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

    return { serverErrors: serverErrors, error: error, googlePayresp : googlePayresp };
}




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
    return { fieldErrors: cardErrors, serverErrors: serverErrors, error: false};
}

 





exports.Authorize = Authorize;
exports.Handle = Handle;