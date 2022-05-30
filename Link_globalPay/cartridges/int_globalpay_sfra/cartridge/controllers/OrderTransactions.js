/* eslint-disable linebreak-style */
'use strict';

var server = require('server');
var security = require('*/cartridge/scripts/middleware/security');
var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelpers');
var Resource = require('dw/web/Resource');
var Transaction = require('dw/system/Transaction');
var OrderMgr = require('dw/order/OrderMgr');
var Order = require('dw/order/Order');
var globalpayconstants = require('*/cartridge/scripts/constants/globalPayConstant');

/**
 * OrderTransactions-RefundTransaction : The OrderTransactions-RefundTransaction endpoint
 * will render the refund APi functionality from GP. Once a order is completed and needs order
 * to be refunded.
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
  var order;
  var ordertransactionid;
  var amount;
  var transactionData;
  var canceldescription;
  if (!(res.viewData.securityErrorMessage)) {
    order = OrderMgr.getOrder(req.querystring.orderID);
    if (!order) {
      res.setStatusCode(200);
      refundresult = Resource.msg('order.invalididerror', 'globalpay', null);
    } else {
      ordertransactionid = order.paymentTransaction.paymentInstrument.custom.gp_transactionid;
      amount = ((order.totalGrossPrice) * 100).toFixed();

    // check payment status
      if (order.getPaymentStatus() === 2) {
        transactionData = {
          transaction_id: ordertransactionid,
          amount: amount
        };
        refundresult = globalPayHelper.refund(transactionData);
        if (refundresult == undefined || refundresult == null) {
          res.setStatusCode(400);
        } else if (refundresult.status) {
          canceldescription = Resource.msg('order.refund.canceldecsription', 'globalpay', null);
          Transaction.wrap(function () {
            OrderMgr.cancelOrder(order);
            order.setCancelDescription(canceldescription);
          });
        } else {
          res.setStatusCode(400);
        }
      } else if (order.status === 6) {
        res.setStatusCode(200);
        refundresult = Resource.msg('order.refund.alreadyrefunded', 'globalpay', null);
      } else {
        res.setStatusCode(200);
        refundresult = {
          error: Resource.msg('order.refund.error', 'globalpay', null)
        };
      }
    }
  }
  res.json({
    refundresult: refundresult
  });
  next();
});

/**
 * OrderTransactions-CaptureTransaction : The OrderTransactions-CaptureTransaction endpoint will
 * render the Capture API functionality from GP. Once a order is authorized and needs that amount to
 * be captured.
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
  var ordertransactionid;
  var amount;
  var paymentID;
  var order;
  var transactionData;
  if (!(res.viewData.securityErrorMessage)) {
    order = OrderMgr.getOrder(req.querystring.orderID);
    if (!order) {
      res.setStatusCode(200);
      captureresult = Resource.msg('order.invalididerror', 'globalpay', null);
    } else {
      ordertransactionid = order.paymentTransaction.paymentInstrument.custom.gp_transactionid;
      amount = ((order.totalGrossPrice) * 100).toFixed();
      paymentID = order.paymentTransaction.paymentInstrument.custom.gp_paymentmethodid;

    // check payment status
      if (order.getPaymentStatus() === 0) {
        transactionData = {
          transaction_id: ordertransactionid,
          amount: amount,
          capture_sequence: globalpayconstants.captureTransaction.capture_sequence,
          total_capture_count: 0,
          payment_method: {
            entry_mode: globalpayconstants.captureTransaction.entry_mode,
            id: paymentID
          }
        };
        captureresult = globalPayHelper.capture(transactionData);
        if (captureresult.status != null) {
          Transaction.wrap(function () {
            order.setPaymentStatus(Order.PAYMENT_STATUS_PAID);
          });
        } else {
          res.setStatusCode(400);
        }
      } else {
        res.setStatusCode(200);
        captureresult = {
          error: Resource.msg('order.capture.invalidorder', 'globalpay', null)
        };
      }
    }
  } else {
    res.setStatusCode(400);
  }

  res.json({
    captureresult: captureresult
  });
  next();
});

/**
 * OrderTransactions-VoidTransaction : The OrderTransactions-CaptureTransaction
 * endpoint will render the Capture API functionality from GP.
 * Once a order is authorized and needs that amount to be captured.
 * @name Base/OrderTransactions-CaptureTransaction
 * @function
 * @memberof CaptureTransaction
 * @param {middleware} - server.middleware.https
 * @param {serverfunction} - post
 **/
server.post('CancelTransaction',
 security.ValidateHeaders,
 server.middleware.https,
 function (req, res, next) {
   var reverseresult;
   var ordertransactionid;
   var amount;
   var order;
   var transactionData;
   var canceldescription;
   if (!(res.viewData.securityErrorMessage)) {
     order = OrderMgr.getOrder(req.querystring.orderID);
     if (!order) {
       res.setStatusCode(200);
       reverseresult = Resource.msg('order.invalididerror', 'globalpay', null);
     } else {
       ordertransactionid = order.paymentTransaction.paymentInstrument.custom.gp_transactionid;
       amount = ((order.totalGrossPrice) * 100).toFixed();

       if (order.getPaymentStatus() === 0) {
         transactionData = {
           transaction_id: ordertransactionid,
           amount: amount
         };
         reverseresult = globalPayHelper.cancel(transactionData);
         if (reverseresult == undefined || reverseresult == null) {
           res.setStatusCode(400);
         } else if (reverseresult.status) {
           canceldescription = Resource.msg('order.revrese.canceldecsription', 'globalpay', null);
           Transaction.wrap(function () {
             OrderMgr.cancelOrder(order);
             order.setCancelDescription(canceldescription);
           });
         } else {
           res.setStatusCode(400);
         }
       } else {
         res.setStatusCode(200);
         reverseresult = {
           error: Resource.msg('order.capture.invalidorder', 'globalpay', null)
         };
       }
     }
   } else {
     res.setStatusCode(400);
   }
   res.json({
     reverseresult: reverseresult
   });
   next();
 });

module.exports = server.exports();
