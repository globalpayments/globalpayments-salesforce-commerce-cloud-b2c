'use strict';

/**
 * OrderTransactions-RefundTransaction : The OrderTransactions-RefundTransaction endpoint will render the refund APi functionality from GP. Once a order is completed and needs order to be refunded.
 *
 **/
var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
var globalpayconstants = require('*/cartridge/scripts/constants/globalpayconstants');
var security = require('*/cartridge/scripts/models/SecurityModel');
var Resource = require('dw/web/Resource');
var Transaction = require('dw/system/Transaction');
var OrderMgr = require('dw/order/OrderMgr');
var responseUtils = require('app_storefront_controllers/cartridge/scripts/util/Response');
var guard = require(globalpayconstants.GUARD);

 function refundTransaction() {
    var refundresult;
    var order;
    var req = request.httpParameterMap;
    var secureheaders = security.validateHeaders(request.httpHeaders.clientid);
        if(secureheaders){
            order = OrderMgr.getOrder(req.orderID.stringValue);
                var ordertransactionid = order.paymentTransaction.paymentInstrument.custom.gp_transactionid;
                var amount = ((order.totalGrossPrice)*100).toFixed();
                if(order.getPaymentStatus()==2){
                    var transactionData = {
                    transaction_id: ordertransactionid,  // Transaction ID 
                    amount: amount //order.amount
                };
                refundresult = globalPayHelper.refund(transactionData);
                if(refundresult== undefined || refundresult == null){
                    response.setStatus(400);
                }
                else if(refundresult.status){
                    var canceldescription = Resource.msg('order.refund.canceldecsription', 'globalpay', null);
                    Transaction.wrap(function () {
                        OrderMgr.cancelOrder(order);
                        order.setCancelDescription(canceldescription);
                    });
                }else{
                    response.setStatus(400);
                }

            }else if(order.status==6){
                response.setStatus(400);
                refundresult= Resource.msg('order.refund.alreadyrefunded', 'globalpay', null);

            }else{
                response.setStatus(400);
                refundresult = {
                    error:  Resource.msg('order.refund.error', 'globalpay', null)
                }
            }
        }
    responseUtils.renderJSON({
            refundresult :  refundresult
    });
}

/**
 * OrderTransactions-CaptureTransaction : The OrderTransactions-CaptureTransaction endpoint will render the Capture API functionality from GP. Once a order is authorized and needs that amount to be captured.
 * @name Base/OrderTransactions-CaptureTransaction
 * @function
 * @memberof CaptureTransaction
 * @param {middleware} - server.middleware.https
 * @param {serverfunction} - post
 **/
function captureTransaction(){
     var captureresult;
     var req = request.httpParameterMap;
     var secureheaders = security.validateHeaders(request.httpHeaders.clientid);
         if(secureheaders){
             var order = OrderMgr.getOrder(req.orderID.stringValue);
                 var ordertransactionid = order.paymentTransaction.paymentInstrument.custom.gp_transactionid;
                 var globalpayconstants = require('*/cartridge/scripts/constants/globalpayconstants');
                 var amount = ((order.totalGrossPrice)*100).toFixed();
                 var paymentID = order.paymentTransaction.paymentInstrument.custom.gp_paymentmethodid;
                 
             if(order.getPaymentStatus()==0){
                 var transactionData = {
                     transaction_id: ordertransactionid,  // Transaction ID
                     amount: amount, //order.amount
                     capture_sequence: globalpayconstants.captureTransaction.capture_sequence,
                     total_capture_count: 0,
                     payment_method: {
                         entry_mode: globalpayconstants.captureTransaction.entry_mode,
                         id: paymentID // paymentID
                     }
                 };
                 captureresult = globalPayHelper.capture(transactionData);
                 var status = captureresult;
                 if(captureresult.status!=null){
                     Transaction.wrap(function () {
                         order.setPaymentStatus(dw.order.Order.PAYMENT_STATUS_PAID);
                     });
                 }else{
                     response.setStatus(400);
                 }
             }else{
                 response.setStatus(400);
                 captureresult={
                     error: Resource.msg('order.capture.invalidorder', 'globalpay', null)
                 }
             }
         }else{
           response.setStatus(400);
     }
 
     responseUtils.renderJSON({
     captureresult: captureresult
   });

 }

/**
 * OrderTransactions-cancelTransaction : The OrderTransactions-cancelTransaction endpoint will render the Capture API functionality from GP. Once a order is authorized and needs that amount to be captured.
 * @name Base/OrderTransactions-cancelTransaction
 * @function
 * @memberof cancelTransaction
 * @param {middleware} - server.middleware.https
 * @param {serverfunction} - post
 **/
 function cancelTransaction(){
    var reverseresult;
    var req = request.httpParameterMap;
    var secureheaders = security.validateHeaders(request.httpHeaders.clientid);
        if(secureheaders){
            var order = OrderMgr.getOrder(req.orderID.stringValue);
                var ordertransactionid = order.paymentTransaction.paymentInstrument.custom.gp_transactionid;
                var globalpayconstants = require('*/cartridge/scripts/constants/globalpayconstants');
                var amount = ((order.totalGrossPrice)*100).toFixed();

            if (order.getPaymentStatus() == 0) {
                var transactionData = {
                    transaction_id: ordertransactionid,  // Transaction ID
                    amount: amount //order.amount
            };
                reverseresult = globalPayHelper.cancel(transactionData);
                var status = reverseresult;
                if(reverseresult== undefined || reverseresult == null){
                    response.setStatus(400);
                }
                else if(reverseresult.status){
                    var canceldescription = Resource.msg('order.revrese.canceldecsription', 'globalpay', null);
                    Transaction.wrap(function () {
                        OrderMgr.cancelOrder(order);
                        order.setCancelDescription(canceldescription);
                    });
                }else{
                    response.setStatus(400);
                }

            }else if(order.status==2){
                response.setStatus(400);
                refundresult= Resource.msg('order.cancel.alreadypaid', 'globalpay', null);

            }else{
                response.setStatus(400);
                refundresult = {
                    error:  Resource.msg('order.cancel.error', 'globalpay', null)
            }
            }
        }else{
          response.setStatus(400);
    }

   responseUtils.renderJSON({
     reverseresult: reverseresult
   });
}

/*
* Module exports
*/

/*
* Web exposed methods
*/
 /* @see module:controllers/OrderTransaction~RefundTransaction */
 exports.RefundTransaction = guard.ensure(['https'], refundTransaction);
 /* @see module:controllers/OrderTransaction~CaptureTransaction */
 exports.CaptureTransaction = guard.ensure(['https'], captureTransaction);
  /* @see module:controllers/OrderTransaction~cancelTransaction */
  exports.CancelTransaction = guard.ensure(['https'], cancelTransaction);
 
