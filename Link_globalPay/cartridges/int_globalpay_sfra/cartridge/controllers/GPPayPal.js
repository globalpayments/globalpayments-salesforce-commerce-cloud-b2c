/* eslint-disable linebreak-style */
/* eslint-disable global-require */
'use strict';
var server = require('server');
var URLUtils = require('dw/web/URLUtils');
var Transaction = require('dw/system/Transaction');
var OrderMgr = require('dw/order/OrderMgr');
/**
 * GPPayPal-PayPalReturn : The GPPayPal-PayPalReturn endpoint invokes paypal return
 * @name Base/GPPayPal-PayPalReturn
 * @function
 * @memberof GPPayPal
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.use('PayPalReturn', function (req, res, next) {
  var gputil = require('*/cartridge/scripts/utils/gputil');
  var globalpayconstants = require('*/cartridge/scripts/constants/globalpayConstant');
  var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
  var HookManager = require('dw/system/HookMgr');
  var paymentFormResult;
  var orderId = req.httpParameterMap.id.toString().split('_')[2];
  var order = OrderMgr.getOrder(orderId);
  if (HookManager.hasHook('app.payment.processor.globalpay_paypal')) {
    paymentFormResult = HookManager.callHook('app.payment.processor.globalpay_paypal',
                'Capture',
                order
            );
  }
  if (!empty(paymentFormResult) && (paymentFormResult.status === globalpayconstants.paypalData.captureStatus || paymentFormResult.status === globalpayconstants.paypalData.authorizedStatus)) {
    gputil.orderUpdate(order);
    COHelpers.sendConfirmationEmail(order, req.locale.id);
  }
  orderId = order.orderNo;
  res.render('checkout/globalpay/threeds', {
    orderId: orderId,
    orderToken: order.orderToken
  });
  return next();
});

/**
 * GPPayPal-PayPalCancel : The GPPayPal-PayPalCancel endpoint invokes paypal return
 * @name Base/GPPayPal-PayPalCancel
 * @function
 * @memberof GPPayPal
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.use('PayPalCancel', function (req, res, next) {
  res.render('globalpay/threeds');
  var orderId = req.httpParameterMap.id.toString().split('_')[2];
  var order = OrderMgr.getOrder(orderId);
  Transaction.wrap(function () { OrderMgr.failOrder(order, true); });
  res.redirect(URLUtils.https('Checkout-Begin', 'orderID', order.orderNo, 'orderToken', order.orderToken));

  return next();
});

/**
 * GPPayPal-PayPalStatus : The GPPayPal-PayPalStatus endpoint invokes paypal return
 * @name Base/GPPayPal-PayPalStatus
 * @function
 * @memberof GPPayPal
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.use('PayPalStatus', function (req, res, next) {
  res.render('globalpay/threeds');
  return next();
});


module.exports = server.exports();
