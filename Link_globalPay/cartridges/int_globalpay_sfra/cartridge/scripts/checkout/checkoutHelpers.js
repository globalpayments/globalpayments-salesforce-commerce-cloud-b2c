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
var Resource = require('dw/web/Resource');
var Site = require('dw/system/Site');
/**
 * handles the payment authorization for each payment instrument
 * @param {dw.order.Order} order - the order object
 * @param {string} orderNumber - The order number for the order
 * @returns {Object} an error object
 */
function handlePayments(order, orderNumber) {
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
                          //  req,
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


/**
 * Sends a confirmation to the current user
 * @param {dw.order.Order} order - The current user's order
 * @param {string} locale - the current request's locale id
 * @returns {void}
 */
 function sendConfirmationEmail(order, locale) {
  var OrderModel = require('*/cartridge/models/order');
  var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
  var Locale = require('dw/util/Locale');
  var gputil = require('*/cartridge/scripts/utils/gputil');
      gputil.orderUpdate(order);
  var currentLocale = Locale.getLocale(locale);

  var orderModel = new OrderModel(order, { countryCode: currentLocale.country, containerView: 'order' });

  var orderObject = { order: orderModel };

  var emailObj = {
      to: order.customerEmail,
      subject: Resource.msg('subject.order.confirmation.email', 'order', null),
      from: Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@testorganization.com',
      type: emailHelpers.emailTypes.orderConfirmation,
      paymentMethod: order.paymentInstruments[0].paymentMethod
  };

  emailHelpers.sendEmail(emailObj, 'checkout/confirmation/confirmationEmail', orderObject);
}
var output = {};
Object.keys(base).forEach(function (key) {
    output[key] = base[key];
});

output.handlePayments = handlePayments;
output.savePaymentInstrumentToWallet = savePaymentInstrumentToWallet;
output.sendConfirmationEmail = sendConfirmationEmail;
module.exports = output;