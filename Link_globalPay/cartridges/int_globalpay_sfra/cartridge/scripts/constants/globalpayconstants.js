'use strict';
function globalpayConstants(){}
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
 globalpayConstants.authorizationData = authorizationData;

 var paypalData = new Object();
 paypalData.account_name = 'transaction_processing';
 paypalData.channel = 'CNP';
 paypalData.source = 'BROWSER';// need customize
 paypalData.type = 'SALE';
 paypalData.paypal = 'paypal';
 paypalData.entryMode = 'paypal';

 globalpayConstants.paypalData = paypalData;

module.exports = globalpayConstants;