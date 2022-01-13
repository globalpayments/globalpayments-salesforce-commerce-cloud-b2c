'use strict';
var page = module.superModule;
var server = require('server');

server.use('PayPalReturn', function(req, res, next){
        var Transaction = require('dw/system/Transaction');
        var OrderMgr = require('dw/order/OrderMgr');
        var gputil = require('*/cartridge/scripts/utils/gputil');
        var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
        var reqMap = req.httpParameterMap;
        var orderId = req.httpParameterMap.id.toString().split('_')[2];
        var order = OrderMgr.getOrder(orderId);
        COHelpers.sendConfirmationEmail(order, req.locale.id);
        gputil.orderUpdate(order);
        //Transaction.wrap(function () { OrderMgr.failOrder(order, true); });
        var orderId = order.orderNo;
        res.render('checkout/globalpay/threeds',{
                orderId : orderId,
                orderToken : order.orderToken
        });
        //res.redirect(URLUtils.https('Order-Confirm', 'orderID', order.orderNo, 'orderToken',order.orderToken)); 
        return next();
});

server.use('PayPalCancel', function(req, res, next){
        res.render('globalpay/threeds');
        var URLUtils = require('dw/web/URLUtils');
        var reqMap = req.httpParameterMap;
        var Transaction = require('dw/system/Transaction');
        var OrderMgr = require('dw/order/OrderMgr');
        var orderId = req.httpParameterMap.id.toString().split('_')[2];
        var order = OrderMgr.getOrder(orderId);
        Transaction.wrap(function () { OrderMgr.failOrder(order, true); });
        res.redirect(URLUtils.https('Checkout-Begin', 'orderID', order.orderNo, 'orderToken',order.orderToken)); 
       
        return next();
});

server.use('PayPalStatus', function(req, res, next){
    res.render('globalpay/threeds');
    var reqMap = req.httpParameterMap;
    return next();
});


module.exports = server.exports();