'use strict';
var orderUpdate = function(order){
    var Order  = require('dw/order/Order');
    var Transaction = require('dw/system/Transaction');
    var OrderMgr = require('dw/order/OrderMgr');
  
    Transaction.wrap(function () {
        var placeOrderStatus = OrderMgr.placeOrder(order);
        order.setPaymentStatus(dw.order.Order.PAYMENT_STATUS_PAID);
        order.setStatus(Order.ORDER_STATUS_COMPLETED); 
        });

        return;
}
module.exports = {
    orderUpdate : orderUpdate
};