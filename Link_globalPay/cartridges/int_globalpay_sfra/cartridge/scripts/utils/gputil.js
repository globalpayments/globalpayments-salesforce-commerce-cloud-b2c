'use strict';
var orderUpdate = function (order) {
  var Order = require('dw/order/Order');
  var Transaction = require('dw/system/Transaction');
  var OrderMgr = require('dw/order/OrderMgr');
  var globalPayPreferences = require('*/cartridge/scripts/helpers/globalPayPreferences');
  var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
  var preferences = globalPayPreferences.getPreferences();
  var captureMode = preferences.captureMode;

  Transaction.wrap(function () {
    var placeOrderStatus = OrderMgr.placeOrder(order);
    if (captureMode.value == preferences.captureModeValue) {
      order.setPaymentStatus(dw.order.Order.PAYMENT_STATUS_PAID);
      order.setStatus(Order.ORDER_STATUS_COMPLETED);
    }
  });

  return;
};
module.exports = {
  orderUpdate: orderUpdate
};
