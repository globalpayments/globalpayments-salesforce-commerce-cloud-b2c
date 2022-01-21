'use strict';
function globalpayConstants() {}
var authenticationData = new Object();
authenticationData.account_name = 'transaction_processing';
authenticationData.channel = 'CNP';
authenticationData.source = 'BROWSER';
globalpayConstants.authenticationData = authenticationData;


var authorizationData = new Object();
authorizationData.account_name = 'transaction_processing';
authorizationData.channel = 'CNP';
authorizationData.source = 'BROWSER';
authorizationData.type = 'SALE';
authorizationData.entrymode = 'ECOM';
authorizationData.reference = '93459c79-f3f9-427d-84d9-ca0584bb55bf';
authorizationData.usage_mode = 'MULTIPLE';
globalpayConstants.authorizationData = authorizationData;

var paypalData = new Object();
paypalData.account_name = 'transaction_processing';
paypalData.channel = 'CNP';
paypalData.source = 'BROWSER';
paypalData.type = 'SALE';
paypalData.paypal = 'paypal';
paypalData.entryMode = 'paypal';
paypalData.paymentTypeCode = 'GP_DW_PAYPAL';
globalpayConstants.paypalData = paypalData;

var googlePay = new Object();
googlePay.account_name = 'transaction_processing';
googlePay.channel = 'CNP';
googlePay.type = 'SALE';
googlePay.entryMode = 'ECOM';
googlePay.provider = 'PAY_BY_GOOGLE';
globalpayConstants.googlePay = googlePay;

var creditCardPay = new Object();
creditCardPay.securityCode = '121';
creditCardPay.creditCardNumber = 'creditCardNumber';
creditCardPay.entry_mode = 'ECOM';
creditCardPay.paymentMethod = 'CREDIT_CARD';
globalpayConstants.creditCardPay = creditCardPay;

var captureTransaction = new Object();
captureTransaction.capture_sequence = 'FIRST';
captureTransaction.entry_mode = 'ECOM';
globalpayConstants.captureTransaction = captureTransaction;

var applePay = new Object();
applePay.account_name = 'transaction_processing';
applePay.channel = 'CNP';
applePay.type = 'SALE';
applePay.entryMode = 'ECOM';
applePay.provider = 'APPLEPAY';

globalpayConstants.applePay = applePay;
module.exports = globalpayConstants;
