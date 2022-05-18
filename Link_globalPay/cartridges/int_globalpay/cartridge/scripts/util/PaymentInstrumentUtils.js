'use strict';
var Transaction = require('dw/system/Transaction');
var Resource = require('dw/web/Resource');
var PaymentInstrument = require('dw/order/PaymentInstrument');
var BasketMgr = require('dw/order/BasketMgr');
var collections = require('*/cartridge/scripts/util/collections');
/**
 * Update the order payment instrument when card capture response arrived.
 * @param Order
 */


function ApplePaymentOrderUpdate(order, serviceResponse) {
	//Update Service Response to the customer  paymentinstrument Object
	//UpdateMobilePaymentTransactionCardAuthorize(CardHelper.getNonGCPaymemtInstument(order), serviceResponse);
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

function RemoveExistingPaymentInstruments(paymentType) {
	var paymentInstrument;
	var paymentInstruments;
	var currentBasket = BasketMgr.getCurrentBasket();
  
	paymentInstruments = currentBasket.getPaymentInstruments(
		  PaymentInstrument.METHOD_CREDIT_CARD
	  );
  
	collections.forEach(paymentInstruments, function (item) {
	  currentBasket.removePaymentInstrument(item);
	});
  
	paymentInstruments = currentBasket.getPaymentInstruments(
		  Resource.msg('paymentmethodname.googlepay', 'globalpay', null)
	  );
  
	collections.forEach(paymentInstruments, function (item) {
	  currentBasket.removePaymentInstrument(item);
	});
  
	paymentInstruments = currentBasket.getPaymentInstruments(
		Resource.msg('paymentmethodname.paypal', 'globalpay', null)
	);
  
	collections.forEach(paymentInstruments, function (item) {
	  currentBasket.removePaymentInstrument(item);
	});
  
  
	if (paymentType === PaymentInstrument.METHOD_CREDIT_CARD) {
	  paymentInstrument = currentBasket.createPaymentInstrument(
		  PaymentInstrument.METHOD_CREDIT_CARD, currentBasket.totalGrossPrice
	  );
	} else if (paymentType === Resource.msg('paymentmethodname.googlepay', 'globalpay', null)) {
	  paymentInstrument = currentBasket.createPaymentInstrument(
		  Resource.msg('paymentmethodname.googlepay', 'globalpay', null), currentBasket.totalGrossPrice
	  );
	} else if (paymentType === Resource.msg('paymentmethodname.paypal', 'globalpay', null)) {
	  paymentInstrument = currentBasket.createPaymentInstrument(
		  Resource.msg('paymentmethodname.paypal', 'globalpay', null), currentBasket.totalGrossPrice
			);
	}
  
	return paymentInstrument;
  }
  


module.exports = {
  ApplePaymentOrderUpdate: ApplePaymentOrderUpdate,
  RemoveExistingPaymentInstruments: RemoveExistingPaymentInstruments
};