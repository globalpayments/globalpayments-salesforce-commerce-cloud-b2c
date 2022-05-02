'use strict';

/**
 * Update the order payment instrument when card capture response arrived.
 * @param Order
 */


function ApplePaymentOrderUpdate(order, serviceResponse) {
	// Update Service Response to the customer  paymentinstrument Object
  var OrderMgr = require('dw/order/OrderMgr');
  var Status = require('dw/system/Status');
  var Transaction = require('dw/system/Transaction');
  var Order = require('dw/order/Order');
  if (serviceResponse.success) {
    var orderPlacementStatus = Transaction.wrap(function () {
      if (OrderMgr.placeOrder(order) === Status.ERROR) {
        OrderMgr.failOrder(order);
        return false;
      }

      order.setConfirmationStatus(Order.CONFIRMATION_STATUS_CONFIRMED);
      return true;
    });

    if (orderPlacementStatus === Status.ERROR) {
      return false;
    } else {
      return true;
    }
  } else {
    var serverErrors = [];
    error = true;
    serverErrors.push(
			Resource.msg('error.technical', 'checkout', null)
		);
    return false;
  }
}


module.exports = {
  ApplePaymentOrderUpdate: ApplePaymentOrderUpdate
};
