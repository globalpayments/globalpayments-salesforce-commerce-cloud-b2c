'use strict';
var Logger = require('dw/system/Logger');
var Transaction = require('dw/system/Transaction');
/**
 * Update the order payment instrument when card capture response arrived.
 * @param Order
 */


function ApplePaymentOrderUpdate(order, serviceResponse) {
	//Update Service Response to the customer  paymentinstrument Object
	var OrderMgr = require('dw/order/OrderMgr');
	var Status = require('dw/system/Status');
	if (serviceResponse.success) {
		var orderPlacementStatus = Transaction.wrap(function () {
			if (OrderMgr.placeOrder(order) === Status.ERROR) {
				OrderMgr.failOrder(order);
				return false;
			}

			order.setConfirmationStatus(dw.order.Order.CONFIRMATION_STATUS_CONFIRMED);
			return true;
		});

		if (orderPlacementStatus === Status.ERROR) {
			return false;
		}else{
			return true;
		}
	}else{
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