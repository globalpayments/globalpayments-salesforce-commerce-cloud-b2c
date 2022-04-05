'use strict';
function globalpayConstants() {}
var authenticationData = new Object();
authenticationData.account_name = 'transaction_processing';
authenticationData.channel = 'CNP';
authenticationData.source = 'BROWSER';
authenticationData.country = 'US';
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
paypalData.captureStatus = 'CAPTURED';
paypalData.authorizedStatus = 'PREAUTHORIZED';
globalpayConstants.paypalData = paypalData;

var googlePay = new Object();
googlePay.account_name = 'transaction_processing';
googlePay.channel = 'CNP';
googlePay.type = 'SALE';
googlePay.entryMode = 'ECOM';
googlePay.provider = 'PAY_BY_GOOGLE';
googlePay.paymentTypeCode = 'GP_DW_GOOGLE_PAY';
googlePay.captureStatus = 'CAPTURED';
googlePay.authorizedStatus = 'PREAUTHORIZED';
globalpayConstants.googlePay = googlePay;

var creditCardPay = new Object();
creditCardPay.securityCode = '121';
creditCardPay.creditCardNumber = 'creditCardNumber';
creditCardPay.entry_mode = 'ECOM';
creditCardPay.paymentMethod = 'CREDIT_CARD';
creditCardPay.captureStatus = 'CAPTURED';
creditCardPay.declinedStatus ='DECLINED';
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
applePay.paymentTypeCode = 'GP_DW_APPLE_PAY';

globalpayConstants.applePay = applePay;

var threeDsStepOne = new Object();
threeDsStepOne.account_name = 'transaction_processing';
threeDsStepOne.source = 'BROWSER';
threeDsStepOne.preference = 'NO_PREFERENCE';
threeDsStepOne.method_url_completion_status = 'YES';
threeDsStepOne.merchant_contact_url = 'http://www.vacationtoplan.in/shopping/contact/';
threeDsStepOne.time_created_reference = '2022-01-23T22:17:11.000000Z';
threeDsStepOne.address_match_indicator = true
threeDsStepOne.accept_header = '*/*';
threeDsStepOne.color_depth = 'TWENTY_FOUR_BITS';
threeDsStepOne.ip = '82.217.170.253';
threeDsStepOne.java_enabled = false;
threeDsStepOne.javascript_enabled = true;
threeDsStepOne.screen_height = 864;
threeDsStepOne.screen_width = 1536;
threeDsStepOne.challenge_window_size = 'WINDOWED_500X600';
threeDsStepOne.user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36';
threeDsStepOne.timezone = '-1';

globalpayConstants.threeDsStepOne = threeDsStepOne;
globalpayConstants.SG_CONTROLLER = 'app_storefront_controllers';
globalpayConstants.GP_CONTROLLER = 'int_globalpay_controllers';
globalpayConstants.GUARD = globalpayConstants.SG_CONTROLLER+'/cartridge/scripts/guard';
globalpayConstants.APP = globalpayConstants.SG_CONTROLLER+'/cartridge/scripts/app';
globalpayConstants.GPAPP=globalpayConstants.GP_CONTROLLER+'/cartridge/scripts/gpapp';
globalpayConstants.SGPAGEMETA = globalpayConstants.SG_CONTROLLER+'/cartridge/scripts/meta';
globalpayConstants.SGOBJECT = globalpayConstants.SG_CONTROLLER+'/cartridge/scripts/object';
globalpayConstants.SGRESPONSE = globalpayConstants.SG_CONTROLLER+'/cartridge/scripts/util/Response';
module.exports = globalpayConstants;
