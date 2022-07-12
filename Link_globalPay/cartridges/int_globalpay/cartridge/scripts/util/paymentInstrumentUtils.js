'use strict';
var Transaction = require('dw/system/Transaction');
var Resource = require('dw/web/Resource');
var PaymentInstrument = require('dw/order/PaymentInstrument');
var BasketMgr = require('dw/order/BasketMgr');
var collections = require('*/cartridge/scripts/util/collections');
var OrderMgr = require('dw/order/OrderMgr');
var Status = require('dw/system/Status');
var Order = require('dw/order/Order');
/**
 * Update the order payment instrument when card capture response arrived.
 * @param Order
 */


function applePaymentOrderUpdate(order, serviceResponse) {
	/* Update Service Response to the customer  paymentinstrument Object
	 UpdateMobilePaymentTransactionCardAuthorize(CardHelper.getNonGCPaymemtInstument(order), serviceResponse);
	 */
    var serverErrors = [];
    var orderPlacementStatus;
    if (serviceResponse.success) {
        orderPlacementStatus = Transaction.wrap(function () {
            if (OrderMgr.placeOrder(order) === Status.ERROR) {
                OrderMgr.failOrder(order);
                return false;
            }

            order.setConfirmationStatus(Order.CONFIRMATION_STATUS_CONFIRMED);
            return true;
        });

        if (orderPlacementStatus === Status.ERROR) {
            return false;
        }
        return true;
    }

    serverErrors.push(
			Resource.msg('error.technical', 'checkout', null)
		);
    return false;
}

function removeExistingPaymentInstruments(paymentType) {
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

    if (paymentType === PaymentInstrument.METHOD_CREDIT_CARD ||
	paymentType === Resource.msg('paymentmethodname.googlepay', 'globalpay', null) ||
	paymentType === Resource.msg('paymentmethodname.paypal', 'globalpay', null) ||
    paymentType === Resource.msg('paymentmethodname.ideal', 'globalpay', null) ||
    paymentType === Resource.msg('paymentmethodname.giropay', 'globalpay', null) ||
    paymentType === Resource.msg('paymentmethodname.alipay', 'globalpay', null) ||
    paymentType === Resource.msg('paymentmethodname.sofortpay', 'globalpay', null)||
    paymentType === Resource.msg('paymentmethodname.bitpay', 'globalpay', null)||
    paymentType === Resource.msg('paymentmethodname.bancontactpay', 'globalpay', null)||
    paymentType === Resource.msg('paymentmethodname.eps', 'globalpay', null)||
    paymentType === Resource.msg('paymentmethodname.mybank', 'globalpay', null) ||
    paymentType === Resource.msg('paymentmethodname.unionpay', 'globalpay', null) ||
    paymentType === Resource.msg('paymentmethodname.wechatpay', 'globalpay', null) ||
    paymentType === Resource.msg('paymentmethodname.przelewy24pay', 'globalpay', null)) {
        paymentInstrument = currentBasket.createPaymentInstrument(
		paymentType, currentBasket.totalGrossPrice
			);
    }

    return paymentInstrument;
}


module.exports = {
    applePaymentOrderUpdate: applePaymentOrderUpdate,
    removeExistingPaymentInstruments: removeExistingPaymentInstruments
};
