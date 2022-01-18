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
            var paypalData = {
                account_name: globalpayconstants.paypalData.account_name,
                channel: globalpayconstants.paypalData.channel,
                capture_mode: captureMode.value,
                type: globalpayconstants.paypalData.type,
                amount: order.merchandizeTotalGrossPrice.value * 100,
                currency: order.currencyCode,
                reference: order.orderNo,
                country: Locale.getLocale(req.locale.id).country,
                payment_method: {
                    //name: "Doe",
                    entry_mode: globalpayconstants.paypalData.entryMode,
                    apm: {
                        provider: globalpayconstants.paypalData.paypal,
                    }
                },
                notifications: {
                    return_url: URLUtils.https('GPPayPal-PayPalReturn').toString(), // "https://zzkf-006.sandbox.us01.dx.commercecloud.salesforce.com/on/demandware.store/Sites-RefArch-Site/en_US/GPPayPal-PayPalReturn",
                    status_url: URLUtils.https('GPPayPal-PayPalStatus').toString(), // "https://zzkf-006.sandbox.us01.dx.commercecloud.salesforce.com/on/demandware.store/Sites-RefArch-Site/en_US/GPPayPal-PayPalStatus",
                    cancel_url: URLUtils.https('GPPayPal-PayPalCancel').toString() //"https://zzkf-006.sandbox.us01.dx.commercecloud.salesforce.com/on/demandware.store/Sites-RefArch-Site/en_US/GPPayPal-PayPalCancel"
                }
            }
            var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
            var paypalresp = globalPayHelper.paypal(paypalData); 
            var serverErrors = [];
            if(!empty(paypalresp) && 'success' in  paypalresp && !paypalresp.success){
                var error = true;
                if('detailedErrorDescription' in authorization)
                serverErrors.push(authorization.error.detailedErrorDescription);
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

    return { serverErrors: serverErrors, error: error, paypalresp : paypalresp };
}




function Handle(basket, req) {
    var currentBasket = basket;
    var cardErrors = {};
    var Locale = require('dw/util/Locale'); 
    var serverErrors = [];
    Transaction.wrap(function () { 
        var paymentInstruments = currentBasket.getPaymentInstruments(
            'GP_DW_PAYPAL'
        );
        collections.forEach(paymentInstruments, function (item) {
            currentBasket.removePaymentInstrument(item);
        });

        var paymentInstrument = currentBasket.createPaymentInstrument(
            'GP_DW_PAYPAL', currentBasket.totalGrossPrice
        );
    });
    return { fieldErrors: cardErrors, serverErrors: serverErrors, error: false};
}

 





exports.Authorize = Authorize;
exports.Handle = Handle;