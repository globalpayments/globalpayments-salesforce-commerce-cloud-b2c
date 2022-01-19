'use strict';

var server = require('server');
var security = require('*/cartridge/scripts/middleware/security');
var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
var Order  = require('dw/order/Order');
var Transaction = require('dw/system/Transaction');
var OrderMgr = require('dw/order/OrderMgr');
/**
 * Account-Show : The Account-Show endpoint will render the shopper's account page. Once a shopper logs in they will see is a dashboard that displays profile, address, payment and order information.
 * @name Base/Account-Show
 * @function
 * @memberof OrderTransactions
 * @param {middleware} - server.middleware.https
 * @param {serverfunction} - get
 * 
 **/

server.post('RefundTransaction',
security.ValidateHeaders,
server.middleware.https,
function (req, res, next) {
    var refundresult;
        if(!(res.viewData.securityErrorMessage)){
                var orderHelpers = require('*/cartridge/scripts/order/orderHelpers');
                var order = OrderMgr.getOrder(req.querystring.orderID);
                var ordertransactionid = order.paymentTransaction.paymentInstrument.custom.gp_transactionid;
                var amount = (order.totalGrossPrice)*100;
            if(order.status==5){
                var transactionData = {
                    transaction_id: ordertransactionid,  // Transaction ID 
                    amount: amount //order.amount
                };
                refundresult = globalPayHelper.refund(transactionData);
                var test = refundresult;
                if(refundresult.status){
                    Transaction.wrap(function () {
                        order.setStatus(Order.ORDER_STATUS_CANCELLED); 
                    });
                }
                if(refundresult== undefined){
                    res.setStatusCode(400);
                }
            }else if(order.status==6){
                res.setStatusCode(400);
                refundresult= "Cannot process the Order which is already refunded.";
                
            }else{
                res.setStatusCode(400);
                refundresult = {
                    error: "Invalid data input"
                }
            }
        }else{
            //refundresult = res.viewData.errorMessage;
        }
    res.json({
        refundresult :  refundresult
    });
    next();
});
server.post('CaptureTransaction',
security.ValidateHeaders,
server.middleware.https,
function (req, res, next) {
    var captureresult;
        if(!(res.viewData.securityErrorMessage)){
                var orderHelpers = require('*/cartridge/scripts/order/orderHelpers');
                var order = OrderMgr.getOrder(req.querystring.orderID);
                var ordertransactionid = order.paymentTransaction.paymentInstrument.custom.gp_transactionid;
                var amount = (order.totalGrossPrice)*100;
                var paymentID = order.paymentTransaction.paymentInstrument.custom.gp_paymentmethodid;
                
            if(order.status!=5 && order.status!=6){
                var transactionData = {
                    transaction_id: ordertransactionid,  // Transaction ID 
                    amount: amount, //order.amount
                    capture_sequence: "FIRST",
                    total_capture_count: 0,
                    payment_method: {
                        entry_mode: "ECOM",
                        id: paymentID // paymentID
  }
                };
                captureresult = globalPayHelper.capture(transactionData);
                var status = captureresult;
                if(captureresult.status!=null){
                    Transaction.wrap(function () {
                        order.setPaymentStatus(dw.order.Order.PAYMENT_STATUS_PAID);
                        order.setStatus(Order.ORDER_STATUS_COMPLETED); 
                    });
                }else{
                    res.setStatusCode(400);
                    captureresult={
                        error: 'Invalid Data Input '
                    }
                }
            }else{
                res.setStatusCode(400);
                captureresult={
                    error: 'Order is either completed or Cancelled'
                }
            }
        }else{

            //refundresult = res.viewData.errorMessage;
        }
          
    res.json({
        captureresult :  captureresult
    });
    next();
});
module.exports = server.exports();
