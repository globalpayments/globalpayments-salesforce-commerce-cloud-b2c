'use strict';
var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
var collections = require('*/cartridge/scripts/util/collections');
var PaymentInstrument = require('dw/order/PaymentInstrument');
var PaymentMgr = require('dw/order/PaymentMgr');
var PaymentStatusCodes = require('dw/order/PaymentStatusCodes');
var Resource = require('dw/web/Resource');
var Transaction = require('dw/system/Transaction');
var globalpayconstants = require('*/cartridge/scripts/constants/globalpayconstants');
var server = require('server');
var StringUtils = require('dw/util/StringUtils');
/**
 * Authorizes a payment using a apple pay.
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
            var applePayData = {
                account_name: globalpayconstants.applePay.account_name,
                channel: globalpayconstants.applePay.channel,
                type:globalpayconstants.applePay.type,
                capture_mode: captureMode.value,
                amount: StringUtils.formatNumber(order.totalGrossPrice.value * 100, "00000000000"),
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
            
            var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
            var applePayresp = globalPayHelper.applePay(applePayData);
            var serverErrors = [];
            if(!empty(applePayresp) && 'success' in  applePayresp && !applePayresp.success){
                var error = true;
                if('detailedErrorDescription' in authorization)
                serverErrors.push(authorization.error.detailedErrorDescription);
            } else {
                try {
                    Transaction.wrap(function () {
                        paymentInstrument.custom.gp_transactionid = applePayresp.id;
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

    return { serverErrors: serverErrors, error: error, applePayresp : applePayresp };
}




function Handle(basket, req) {
    var currentBasket = basket;
    var cardErrors = {};
    var Locale = require('dw/util/Locale'); 
    var Resource = require('dw/web/Resource');
    var serverErrors = [];
    Transaction.wrap(function () { 
        var paymentInstruments = currentBasket.getPaymentInstruments(
            Resource.msg('paymentmethodname.applepay', 'globalpay', null)
        );
        collections.forEach(paymentInstruments, function (item) {
            currentBasket.removePaymentInstrument(item);
        });

        var paymentInstrument = currentBasket.createPaymentInstrument(
            Resource.msg('paymentmethodname.applepay', 'globalpay', null), currentBasket.totalGrossPrice
        );
    });
    return { fieldErrors: cardErrors, serverErrors: serverErrors, error: false};
}

exports.Authorize = Authorize;
exports.Handle = Handle;
