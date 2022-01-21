'use strict';
function globalpayConstants() {}
var authenticationData = new Object();
authenticationData.account_name = 'transaction_processing';
authenticationData.channel = 'CNP';
authenticationData.source = 'BROWSER';// need customize
globalpayConstants.authenticationData = authenticationData;


var authorizationData = new Object();
authorizationData.account_name = 'transaction_processing';
authorizationData.channel = 'CNP';
authorizationData.source = 'BROWSER';// need customize
authorizationData.type = 'SALE';
authorizationData.entrymode = 'ECOM';
authorizationData.reference='93459c79-f3f9-427d-84d9-ca0584bb55bf';
globalpayConstants.authorizationData = authorizationData;

var paypalData = new Object();
paypalData.account_name = 'transaction_processing';
paypalData.channel = 'CNP';
paypalData.source = 'BROWSER';// need customize
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
googlePay.token_format='CARD_NUMBER';
googlePay.expiryMonth='12';
googlePay.expiryYear='25';
googlePay.cryptogram='234234234';
googlePay.token='5167300431085507';
googlePay.eci='3';
googlePay.country='US';
globalpayConstants.googlePay = googlePay;

var creditCardPay = new Object();
creditCardPay.securityCode = '121';
creditCardPay.creditCardNumber = 'creditCardNumber';
creditCardPay.entry_mode = 'ECOM';
creditCardPay.paymentMethod='CREDIT_CARD';
globalpayConstants.creditCardPay = creditCardPay;

var captureTransaction = new Object();
captureTransaction.capture_sequence = 'FIRST';
captureTransaction.entry_mode = 'ECOM';
globalpayConstants.captureTransaction = captureTransaction;

var tokenData = new Object();
tokenData.reference = '93459c79-f3f9-427d-84d9-ca0584bb55bf';
tokenData.usage_mode = 'MULTIPLE';
globalpayConstants.tokenData = tokenData;

module.exports = globalpayConstants;
