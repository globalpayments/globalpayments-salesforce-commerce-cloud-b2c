/* eslint-disable linebreak-style */
'use strict';

var authenticationData = {
    account_name: 'transaction_processing',
    channel: 'CNP',
    source: 'BROWSER'
};


var authorizationData = {
    account_name: 'transaction_processing',
    channel: 'CNP',
    source: 'BROWSER',
    type: 'SALE',
    entrymode: 'ECOM',
    reference: '93459c79-f3f9-427d-84d9-ca0584bb55bf',
    usage_mode: 'MULTIPLE'
};


var paypalData = {
    account_name: 'transaction_processing',
    channel: 'CNP',
    source: 'BROWSER',
    type: 'SALE',
    paypal: 'paypal',
    entryMode: 'paypal',
    paymentTypeCode: 'GP_DW_PAYPAL',
    captureStatus: 'CAPTURED',
    authorizedStatus: 'PREAUTHORIZED'
};

var lpmData = {
    account_name: 'transaction_processing',
    type: 'SALE',
    channel: 'CNP',
    entryMode: 'ECOM'
};

var googlePay = {
    account_name: 'transaction_processing',
    channel: 'CNP',
    type: 'SALE',
    entryMode: 'ECOM',
    provider: 'PAY_BY_GOOGLE',
    paymentTypeCode: 'GP_DW_GOOGLE_PAY',
    captureStatus: 'CAPTURED',
    authorizedStatus: 'PREAUTHORIZED'
};

var creditCardPay = {
    securityCode: '121',
    creditCardNumber: 'creditCardNumber',
    entry_mode: 'ECOM',
    paymentMethod: 'CREDIT_CARD',
    captureStatus: 'CAPTURED',
    declinedStatus: 'DECLINED'
};


var captureTransaction = {
    capture_sequence: 'FIRST',
    entry_mode: 'ECOM'
};


var applePay = {
    account_name: 'transaction_processing',
    channel: 'CNP',
    type: 'SALE',
    entryMode: 'ECOM',
    provider: 'APPLEPAY',
    paymentTypeCode: 'GP_DW_APPLE_PAY'
};


var eciData = {
    five: '05',
    six: '06',
    one: '01',
    two: '02'
};


var captureMode = {
    auto: 'AUTO',
    later: 'LATER'
};


var threeDsStepOne = {
    account_name: 'transaction_processing',
    source: 'BROWSER',
    preference: 'NO_PREFERENCE',
    method_url_completion_status: 'YES',
    merchant_contact_url: 'http://www.vacationtoplan.in/shopping/contact/',
    time_created_reference: '2022-01-23T22:17:11.000000Z',
    address_match_indicator: true,
    accept_header: '*/*',
    color_depth: 'TWENTY_FOUR_BITS',
    ip: '82.217.170.253',
    java_enabled: false,
    javascript_enabled: true,
    screen_height: 864,
    screen_width: 1536,
    challenge_window_size: 'WINDOWED_500X600',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36',
    timezone: '-1'
};

function globalPayConstants() {}
globalPayConstants.authenticationData = authenticationData;
globalPayConstants.authorizationData = authorizationData;
globalPayConstants.paypalData = paypalData;
globalPayConstants.lpmData = lpmData;
globalPayConstants.googlePay = googlePay;
globalPayConstants.creditCardPay = creditCardPay;
globalPayConstants.captureTransaction = captureTransaction;
globalPayConstants.applePay = applePay;
globalPayConstants.eciData = eciData;
globalPayConstants.captureMode = captureMode;

// site preferences
globalPayConstants.gpApiVersion = '2021-03-22';
globalPayConstants.gpGrantType = 'client_credentials';

globalPayConstants.threeDsStepOne = threeDsStepOne;
globalPayConstants.AUTHRESPONSE = 'SUCCESS_AUTHENTICATED';
globalPayConstants.SG_CONTROLLER = 'app_storefront_controllers';
globalPayConstants.GP_CONTROLLER = 'int_globalpay_controllers';
globalPayConstants.GUARD = globalPayConstants.SG_CONTROLLER + '/cartridge/scripts/guard';
globalPayConstants.APP = globalPayConstants.SG_CONTROLLER + '/cartridge/scripts/app';
globalPayConstants.GPAPP = globalPayConstants.GP_CONTROLLER + '/cartridge/scripts/gpapp';
globalPayConstants.SGPAGEMETA = globalPayConstants.SG_CONTROLLER + '/cartridge/scripts/meta';
globalPayConstants.SGOBJECT = globalPayConstants.SG_CONTROLLER + '/cartridge/scripts/object';
globalPayConstants.SGRESPONSE = globalPayConstants.SG_CONTROLLER + '/cartridge/scripts/util/Response';
module.exports = globalPayConstants;
