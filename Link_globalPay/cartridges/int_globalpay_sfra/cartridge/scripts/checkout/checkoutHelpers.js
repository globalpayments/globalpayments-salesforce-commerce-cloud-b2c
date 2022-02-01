'use strict';

/*
    This line has to be updated to reference checkoutHelpers.js from the site cartridge's checkoutHelpers.js
*/

var base = module.superModule;
var PaymentMgr = require('dw/order/PaymentMgr');
var HookMgr = require('dw/system/HookMgr');
var OrderMgr = require('dw/order/OrderMgr');
var Transaction = require('dw/system/Transaction');
var PaymentInstrument = require('dw/order/PaymentInstrument');
/**
 * handles the payment authorization for each payment instrument
 * @param {dw.order.Order} order - the order object
 * @param {string} orderNumber - The order number for the order
 * @returns {Object} an error object
 */
function handlePayments(order, orderNumber, req) {
  var result = {};

  if (order.totalNetPrice !== 0.00) {
    var paymentInstruments = order.paymentInstruments;

    if (paymentInstruments.length === 0) {
      Transaction.wrap(function () { OrderMgr.failOrder(order, true); });
      result.error = true;
    }

    if (!result.error) {
      for (var i = 0; i < paymentInstruments.length; i++) {
        var paymentInstrument = paymentInstruments[i];
        var paymentProcessor = PaymentMgr
                    .getPaymentMethod(paymentInstrument.paymentMethod)
                    .paymentProcessor;
        var authorizationResult;
        if (paymentProcessor === null) {
          Transaction.begin();
          paymentInstrument.paymentTransaction.setTransactionID(orderNumber);
          Transaction.commit();
        } else {
          if (HookMgr.hasHook('app.payment.processor.' + paymentProcessor.ID.toLowerCase())) {
            authorizationResult = HookMgr.callHook(
                            'app.payment.processor.' + paymentProcessor.ID.toLowerCase(),
                            'Authorize',
                            orderNumber,
                            paymentInstrument,
                            paymentProcessor,
                            req,
                            order
                        );
            result.authorizationResult = authorizationResult;
          } else {
            authorizationResult = HookMgr.callHook(
                            'app.payment.processor.default',
                            'Authorize'
                        );
            result.authorizationResult = authorizationResult;
          }
          if (authorizationResult.error) {
            Transaction.wrap(function () { OrderMgr.failOrder(order, true); });
            result.error = true;
            break;
          }
        }
      }
    }
  }
  return result;
}

/**
 * saves payment instruemnt to customers wallet
 * @param {Object} billingData - billing information entered by the user
 * @param {dw.order.Basket} currentBasket - The current basket
 * @param {dw.customer.Customer} customer - The current customer
 * @returns {dw.customer.CustomerPaymentInstrument} newly stored payment Instrument
 */
 function savePaymentInstrumentToWallet(billingData, currentBasket, customer,token) {
  var wallet = customer.getProfile().getWallet();

  return Transaction.wrap(function () {
      var storedPaymentInstrument = wallet.createPaymentInstrument(PaymentInstrument.METHOD_CREDIT_CARD);

      storedPaymentInstrument.setCreditCardHolder(
          currentBasket.billingAddress.fullName
      );
      storedPaymentInstrument.setCreditCardNumber(
          billingData.paymentInformation.cardNumber.value
      );
      storedPaymentInstrument.setCreditCardType(
          billingData.paymentInformation.cardType.value
      );
      storedPaymentInstrument.setCreditCardExpirationMonth(
          billingData.paymentInformation.expirationMonth.value
      );
      storedPaymentInstrument.setCreditCardExpirationYear(
          billingData.paymentInformation.expirationYear.value
      );
      
      storedPaymentInstrument.setCreditCardToken(token);

      return storedPaymentInstrument;
  });
}

base.handlePayments = handlePayments;
base.savePaymentInstrumentToWallet = savePaymentInstrumentToWallet;
module.exports = base;
