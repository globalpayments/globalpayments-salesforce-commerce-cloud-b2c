'use strict';
var OrderMgr = require('dw/order/OrderMgr');
var logger = require('../globalpay/gpLogger').getLogger('globalpay.order');
var drStates = require('../globalpay/gpCustomStates.json');

var Status = require('dw/system/Status');
var MAX_ORDERS_PER_REQUEST = 20;

var updateOrderStatus = function (params) {
  var test = '';

  return test;
};
module.exports = {
  updateOrderStatus: updateOrderStatus
};
