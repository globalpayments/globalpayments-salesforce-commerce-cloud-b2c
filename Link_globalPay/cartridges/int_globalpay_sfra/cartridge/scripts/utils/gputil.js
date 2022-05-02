'use strict';
var orderUpdate = function (order) {
  var Order = require('dw/order/Order');
  var Transaction = require('dw/system/Transaction');
  var OrderMgr = require('dw/order/OrderMgr');
  var globalPayPreferences = require('*/cartridge/scripts/helpers/globalPayPreferences');
  var preferences = globalPayPreferences.getPreferences();
  var captureMode = preferences.captureMode;
// update order status
  Transaction.wrap(function () {
    var placeOrderStatus = OrderMgr.placeOrder(order);
    if (captureMode.value == 'AUTO') {
      order.setPaymentStatus(Order.PAYMENT_STATUS_PAID);
    } else if (captureMode.value == 'LATER') {
      order.setPaymentStatus(Order.PAYMENT_STATUS_NOTPAID);
    }
  });

  return;
};
module.exports = {
  orderUpdate: orderUpdate
};
