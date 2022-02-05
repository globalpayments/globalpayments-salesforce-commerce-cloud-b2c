'use strict';
var page = module.superModule;
var server = require('server');

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
  var Transaction = require('dw/system/Transaction');
  var OrderMgr = require('dw/order/OrderMgr');
  var gputil = require('*/cartridge/scripts/utils/gputil');
  var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
  var HookManager = require('dw/system/HookMgr');
  var reqMap = req.httpParameterMap;
  var orderId = req.httpParameterMap.id.toString().split('_')[2];
  var order = OrderMgr.getOrder(orderId);
      COHelpers.sendConfirmationEmail(order, req.locale.id);

     if (HookManager.hasHook('app.payment.processor.globalpay_paypal')) {
     var paymentFormResult = HookManager.callHook('app.payment.processor.globalpay_paypal',
                'Capture',
                order
            );
      }
      if(!empty(paymentFormResult) && paymentFormResult.paymentStatus == 'COMPLETED')
      gputil.orderUpdate(order);
  var orderId = order.orderNo;
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
  var URLUtils = require('dw/web/URLUtils');
  var reqMap = req.httpParameterMap;
  var Transaction = require('dw/system/Transaction');
  var OrderMgr = require('dw/order/OrderMgr');
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
  var reqMap = req.httpParameterMap;
  return next();
});


module.exports = server.exports();
