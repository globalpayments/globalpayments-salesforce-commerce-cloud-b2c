'use strict';

var server = require('server');
var security = require('*/cartridge/scripts/middleware/security');
var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
var Order = require('dw/order/Order');
var Resource = require('dw/web/Resource');
var Transaction = require('dw/system/Transaction');
var OrderMgr = require('dw/order/OrderMgr');
/**
 * OrderTransactions-RefundTransaction : The OrderTransactions-RefundTransaction endpoint will render the refund APi functionality from GP. Once a order is completed and needs order to be refunded.
 * @name Base/OrderTransactions-RefundTransaction
 * @function
 * @memberof OrderTransactions
 * @param {middleware} - server.middleware.https
 * @param {serverfunction} - post
 *
 **/

server.post('RefundTransaction',
security.ValidateHeaders,
server.middleware.https,
function (req, res, next) {
  var refundresult;
  if (!(res.viewData.securityErrorMessage)) {
    var orderHelpers = require('*/cartridge/scripts/order/orderHelpers');
    var order = OrderMgr.getOrder(req.querystring.orderID);
    var ordertransactionid = order.paymentTransaction.paymentInstrument.custom.gp_transactionid;
    var amount = (order.totalGrossPrice) * 100;
    if (order.getPaymentStatus() == 2) {
      var transactionData = {
        transaction_id: ordertransactionid,  // Transaction ID
        amount: amount // order.amount
      };
      refundresult = globalPayHelper.refund(transactionData);
      if (refundresult == undefined || refundresult == null) {
        res.setStatusCode(400);
      } else if (refundresult.status) {
        var canceldescription = Resource.msg('order.refund.canceldecsription', 'globalpay', null);
        Transaction.wrap(function () {
          OrderMgr.cancelOrder(order);
          order.setCancelDescription(canceldescription);
        });
      } else {
        res.setStatusCode(400);
      }
    } else if (order.status == 6) {
      res.setStatusCode(400);
      refundresult = Resource.msg('order.refund.alreadyrefunded', 'globalpay', null);
    } else {
      res.setStatusCode(400);
      refundresult = {
        error: Resource.msg('order.refund.error', 'globalpay', null)
      };
    }
  } else {
            // refundresult = res.viewData.errorMessage;
  }
  res.json({
    refundresult: refundresult
  });
  next();
});

/**
 * OrderTransactions-CaptureTransaction : The OrderTransactions-CaptureTransaction endpoint will render the Capture API functionality from GP. Once a order is authorized and needs that amount to be captured.
 * @name Base/OrderTransactions-CaptureTransaction
 * @function
 * @memberof CaptureTransaction
 * @param {middleware} - server.middleware.https
 * @param {serverfunction} - post
 **/
server.post('CaptureTransaction',
security.ValidateHeaders,
server.middleware.https,
function (req, res, next) {
  var captureresult;
  if (!(res.viewData.securityErrorMessage)) {
    var orderHelpers = require('*/cartridge/scripts/order/orderHelpers');
    var order = OrderMgr.getOrder(req.querystring.orderID);
    var ordertransactionid = order.paymentTransaction.paymentInstrument.custom.gp_transactionid;
    var amount = (order.totalGrossPrice) * 100;
    var paymentID = order.paymentTransaction.paymentInstrument.custom.gp_paymentmethodid;

    if (order.getPaymentStatus() == 0) {
      var transactionData = {
        transaction_id: ordertransactionid,  // Transaction ID
        amount: amount, // order.amount
        capture_sequence: 'FIRST',
        total_capture_count: 0,
        payment_method: {
          entry_mode: 'ECOM',
          id: paymentID // paymentID
        }
      };
      captureresult = globalPayHelper.capture(transactionData);
      var status = captureresult;
      if (captureresult.status != null) {
        Transaction.wrap(function () {
          order.setPaymentStatus(dw.order.Order.PAYMENT_STATUS_PAID);
        });
      } else {
        res.setStatusCode(400);
      }
    } else {
      res.setStatusCode(400);
      captureresult = {
        error: Resource.msg('order.capture.invalidorder', 'globalpay', null)
      };
    }
  } else {
    res.setStatusCode(400);
  }

  res.json({
    captureresult: captureresult
  });
  next();
});
module.exports = server.exports();
