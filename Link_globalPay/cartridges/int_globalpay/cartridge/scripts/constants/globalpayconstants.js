'use strict';
function globalpayConstants() {}
var authenticationData = {
account_name:'transaction_processing',
channel:'CNP',
source:'BROWSER'
};
globalpayConstants.authenticationData = authenticationData;


var authorizationData = {
account_name :'transaction_processing',
channel : 'CNP',
source : 'BROWSER',
type : 'SALE',
entrymode : 'ECOM',
reference : '93459c79-f3f9-427d-84d9-ca0584bb55bf',
usage_mode : 'MULTIPLE'
};

globalpayConstants.authorizationData = authorizationData;

var paypalData = {
account_name : 'transaction_processing',
channel : 'CNP',
source : 'BROWSER',
type : 'SALE',
paypal : 'paypal',
entryMode : 'paypal',
paymentTypeCode : 'GP_DW_PAYPAL',
captureStatus : 'CAPTURED',
authorizedStatus : 'PREAUTHORIZED',
};

globalpayConstants.paypalData = paypalData;

var googlePay = {
account_name : 'transaction_processing',
channel : 'CNP',
type : 'SALE',
entryMode : 'ECOM',
provider : 'PAY_BY_GOOGLE',
paymentTypeCode : 'GP_DW_GOOGLE_PAY',
captureStatus  :'CAPTURED',
authorizedStatus : 'PREAUTHORIZED'
};

globalpayConstants.googlePay = googlePay;

var creditCardPay = {
securityCode : '121',
creditCardNumber : 'creditCardNumber',
entry_mode : 'ECOM',
paymentMethod : 'CREDIT_CARD',
captureStatus : 'CAPTURED',
declinedStatus :'DECLINED'
};

globalpayConstants.creditCardPay = creditCardPay;

var captureTransaction = {
capture_sequence : 'FIRST',
entry_mode : 'ECOM'
};

globalpayConstants.captureTransaction = captureTransaction;

var applePay = {
account_name : 'transaction_processing',
channel : 'CNP',
type : 'SALE',
entryMode : 'ECOM',
provider : 'APPLEPAY',
paymentTypeCode : 'GP_DW_APPLE_PAY'
};


globalpayConstants.applePay = applePay;

var captureMode = {
auto : 'AUTO',
later : 'LATER'
};

globalpayConstants.captureMode = captureMode;

var threeDsStepOne = {
account_name : 'transaction_processing',
source : 'BROWSER',
preference : 'NO_PREFERENCE',
method_url_completion_status : 'YES',
merchant_contact_url : 'http://www.vacationtoplan.in/shopping/contact/',
time_created_reference : '2022-01-23T22:17:11.000000Z',
address_match_indicator : true,
accept_header : '*/*',
color_depth : 'TWENTY_FOUR_BITS',
ip : '82.217.170.253',
java_enabled : false,
javascript_enabled : true,
screen_height : 864,
screen_width : 1536,
challenge_window_size : 'WINDOWED_500X600',
user_agent : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36',
timezone : '-1'
};


// site preferences
globalpayConstants.gpApiVersion = '2021-03-22';
globalpayConstants.gpGrantType = 'client_credentials';

globalpayConstants.threeDsStepOne = threeDsStepOne;
globalpayConstants.AUTHRESPONSE='SUCCESS_AUTHENTICATED';
globalpayConstants.SG_CONTROLLER = 'app_storefront_controllers';
globalpayConstants.GP_CONTROLLER = 'int_globalpay_controllers';
globalpayConstants.GUARD = globalpayConstants.SG_CONTROLLER+'/cartridge/scripts/guard';
globalpayConstants.APP = globalpayConstants.SG_CONTROLLER+'/cartridge/scripts/app';
globalpayConstants.GPAPP=globalpayConstants.GP_CONTROLLER+'/cartridge/scripts/gpapp';
globalpayConstants.SGPAGEMETA = globalpayConstants.SG_CONTROLLER+'/cartridge/scripts/meta';
globalpayConstants.SGOBJECT = globalpayConstants.SG_CONTROLLER+'/cartridge/scripts/object';
globalpayConstants.SGRESPONSE = globalpayConstants.SG_CONTROLLER+'/cartridge/scripts/util/Response';
module.exports = globalpayConstants;
