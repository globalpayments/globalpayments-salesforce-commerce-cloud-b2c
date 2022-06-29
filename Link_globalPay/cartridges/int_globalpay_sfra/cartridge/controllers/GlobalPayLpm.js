'use strict';
var server = require('server');
var URLUtils = require('dw/web/URLUtils');
var OrderMgr = require('dw/order/OrderMgr');
var Transaction = require('dw/system/Transaction');
/**
 * GPPayPal-PayPalReturn : The GPPayPal-PayPalReturn endpoint invokes paypal return
 * @name Base/GPPayPal-PayPalReturn
 * @function
 * @memberof GPPayPal
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.use('LpmReturn', server.middleware.https, function (req, res, next) {
    var orderId = req.httpParameterMap.reference.toString();
    var order = OrderMgr.getOrder(orderId);
    if (false) {
        res.redirect(URLUtils.https('Checkout-Begin', 'stage', 'payment'));
        Transaction.wrap(function () {OrderMgr.failOrder(order, true);});        
        return next();
    }

   /*if (HookManager.hasHook('app.payment.processor.globalpay_paypal')) {
        paymentFormResult = HookManager.callHook('app.payment.processor.globalpay_paypal',
                'Capture',
                order
            );
    }*/
  //  if (!empty(paymentFormResult) && (paymentFormResult.status === globalpayconstants.paypalData.captureStatus || paymentFormResult.status === globalpayconstants.paypalData.authorizedStatus)) {
      //  gputil.orderUpdate(order);
    //COHelpers.sendConfirmationEmail(order, req.locale.id);
    //}
    orderId = order.orderNo;
    res.render('checkout/globalpay/threeds', {
        orderId: orderId,
        orderToken: order.orderToken
    });
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
server.use('LpmStatus', server.middleware.https, function (req, res, next) {
    var status = req.httpParameterMap.status.toString();
    res.render('globalpay/threeds');
    return next();
});


module.exports = server.exports();