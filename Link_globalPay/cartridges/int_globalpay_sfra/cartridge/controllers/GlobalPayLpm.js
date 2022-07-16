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
    var gputil = require('*/cartridge/scripts/utils/gputil');
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
    var globalpayconstants = require('*/cartridge/scripts/constants/globalPayConstant');
    var orderId = req.httpParameterMap.reference.toString();
    var order = OrderMgr.getOrder(orderId);
    var paymentStatus=req.httpParameterMap.status.toString();


  /* if (HookManager.hasHook('app.payment.processor.globalpay_paypal')) {
        paymentFormResult = HookManager.callHook('app.payment.processor.globalpay_paypal',
                'Capture',
                order
            );
    }*/
    if (!empty(paymentStatus) && (paymentStatus === globalpayconstants.localPayment.captureStatus || paymentStatus === globalpayconstants.localPayment.authorizedStatus)) {
        gputil.orderUpdate(order);
        COHelpers.sendConfirmationEmail(order, req.locale.id);
    }
    else if (!empty(paymentStatus) && (paymentStatus === globalpayconstants.localPayment.pendingStatus || paymentStatus === globalpayconstants.localPayment.declinedStatus)){
        Transaction.wrap(function () {OrderMgr.failOrder(order, true);});     
        res.redirect(URLUtils.https('Checkout-Begin', 'stage', 'payment'));   
        return next();
    }
  
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
