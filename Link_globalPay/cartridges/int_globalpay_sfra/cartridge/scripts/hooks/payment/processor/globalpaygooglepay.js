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
            var paymentForm = server.forms.getForm('billing');
            var token= JSON.parse(paymentForm.creditCardFields.paymentToken.htmlValue);
            var signedMessage=JSON.parse(token.signedMessage);
            var googlePayData = {
                account_name: globalpayconstants.googlePay.account_name,
                channel: globalpayconstants.googlePay.channel,
                type:globalpayconstants.googlePay.type,
                capture_mode: captureMode.value,
                amount: order.totalGrossPrice.value * 100,
                currency: order.currencyCode,
                reference: order.orderNo,
                country:  'US',
                payment_method: {
                    name: order.customerName,
                    entry_mode: globalpayconstants.googlePay.entryMode,
                    digital_wallet: {
                        provider: globalpayconstants.googlePay.provider,
                        //need to be removed once we get the solution for payment token
                        tokenFormat: "CARD_NUMBER",
                        expiryMonth: "12",
                        expiryYear: "25",
                        cryptogram: "234234234",    
                        token: "5167300431085507",          
                        eci: "3"
                        // payment_token: {
                        //     signature:token.signature,
                        //     protocolVersion:token.protocolVersion,
                        //     signedMessage:{
                        //         encryptedMessage: signedMessage.encryptedMessage,
                        //         ephemeralPublicKey:signedMessage.ephemeralPublicKey,
                        //         tag:signedMessage.tag
                        //     }
                        // }  
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