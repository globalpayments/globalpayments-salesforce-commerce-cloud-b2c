/* eslint-disable linebreak-style */
'use strict';
var OrderMgr = require('dw/order/OrderMgr');
var Status = require('dw/system/Status');
var Transaction = require('dw/system/Transaction');
var Order = require('dw/order/Order');
var Resource = require('dw/web/Resource');
/**
 * Update the order payment instrument when card capture response arrived.
 * @param Order
 */


function applePaymentOrderUpdate(order, serviceResponse) {
  var orderPlacementStatus;
  var serverErrors;
	// Update Service Response to the customer  paymentinstrument Object
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

function removeDuplicates(formInfo) {
  // eslint-disable-next-line
  var i = 0;
  var card;
  var wallet = customer.getProfile().getWallet();
  // eslint-disable-next-line
  var paymentInstruments = wallet.getPaymentInstruments(dw.order.PaymentInstrument.METHOD_CREDIT_CARD).toArray().sort(function (a, b) {
    return b.getCreationDate() - a.getCreationDate();
  });
  var ccNumber = formInfo.cardNumber;
  var isDuplicateCard = false;
  var oldCard;
  for (i = 0; i < paymentInstruments.length; i += 1) {
    card = paymentInstruments[i];
    if (card.creditCardExpirationMonth === formInfo.expirationMonth &&
       card.creditCardExpirationYear === formInfo.expirationYear
          && card.creditCardType === formInfo.cardType &&
           (card.getCreditCardNumber().indexOf(ccNumber.substring(ccNumber.length - 4)) > 0)) {
      isDuplicateCard = true;
      oldCard = card;
      break;
    }
  }
  if (isDuplicateCard) {
    wallet.removePaymentInstrument(oldCard);
  }
}


module.exports = {
  applePaymentOrderUpdate: applePaymentOrderUpdate,
  removeDuplicates: removeDuplicates
};
