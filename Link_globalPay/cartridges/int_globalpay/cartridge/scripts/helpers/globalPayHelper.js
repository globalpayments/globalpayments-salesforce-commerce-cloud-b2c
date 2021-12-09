'use strict';

function getPreferences(site) {
    var Site = require('dw/system/Site');
    var currentSite = site instanceof Site ? site : Site.getCurrent();

    return {
        appId: currentSite.getCustomPreferenceValue('gp_app_id'),
        appKey: currentSite.getCustomPreferenceValue('gp_app_key'),
        apiVersion: currentSite.getCustomPreferenceValue('gp_api_version'),
        grantType: currentSite.getCustomPreferenceValue('gp_grant_type'),
        enableGooglepay: currentSite.getCustomPreferenceValue('gp_enable_googlepay'),
        enableApplepay: currentSite.getCustomPreferenceValue('gp_enable_applepay'),
        enablePaypal: currentSite.getCustomPreferenceValue('gp_enable_paypal'),
        env: currentSite.getCustomPreferenceValue('gp_env')
    };
}

function getAccessToken() {
    var accessTokenDTO = require('*/cartridge/scripts/services/dto/AccessToken');

    var preferences = getPreferences();

    var accessTokenRequest = new accessTokenDTO.Request();

    accessTokenRequest.setGrantType(preferences.grantType);
    accessTokenRequest.setAppId(preferences.appId);
    accessTokenRequest.setAppKey(preferences.appKey);
    accessTokenRequest.setNonce(Date.now());

    var globalPayService = require('*/cartridge/scripts/services/globalPayService');
    var service = globalPayService.getService();

    var result = service.call(accessTokenRequest);

    if (result.isOk()) {
        return result.object.token;
    }

    return null;
}

function authenticate() {
    var token = getAccessToken();
    var globalPayServiceCreator = require('*/cartridge/scripts/services/globalPayServiceCreator');
    var globalPayService = globalPayServiceCreator.createService(globalPayServiceCreator.ENDPOINT_AUTHENTICATION, token);

    var result = globalPayService.call({
        account_name: 'transaction_processing',
        channel: 'CNP',
        country: 'US',
        reference: '93459c79-f3f9-427d-84d9-ca0584bb55bf',
        amount: '5000',
        currency: 'USD',
        source: 'BROWSER',
        payment_method: {
            card: {
                number: '4012001037141112',
                expiry_month: '12',
                expiry_year: '25'
            }
        },
        notifications: {
            challenge_return_url: 'http://testing.test/wc-api/globalpayments_threedsecure_challengenotification/',
            three_ds_method_return_url: 'http://testing.test/wc-api/globalpayments_threedsecure_methodnotification/'
        }
    });

    if (result.isOk()) {
        return result.object;
    }

    return null;
}

function authorize() {
    var token = getAccessToken();
    var globalPayServiceCreator = require('*/cartridge/scripts/services/globalPayServiceCreator');
    var globalPayService = globalPayServiceCreator.createService(globalPayServiceCreator.ENDPOINT_TRANSACTION, token);

    var dt = new DTOAuth();

    dt.setSetTOken('asdsadsad');

    var dtoCard = new DTOCard();


    var result = globalPayService.call({
        account_name: 'transaction_processing',
        channel: 'CNP',
        capture_mode: 'LATER',
        type: 'SALE',
        amount: '5000',
        currency: 'USD',
        reference: '93459c79-f3f9-427d-84df-ca0584bb55bf',
        country: 'US',
        payment_method: {
            name: 'Jane',
            entry_mode: 'ECOM',
            card: {
                number: '4242424242424242',
                expiry_month: '09',
                expiry_year: '22',
                cvv: '940',
                avs_address: "RD.asd's Bogong",
                avs_postal_code: '3699'
            }
        }
    });

    if (result.isOk()) {
        return result.object;
    }

    return null;
}

function capture(transactionId) {
    var token = getAccessToken();
    var globalPayServiceCreator = require('*/cartridge/scripts/services/globalPayServiceCreator');
    var globalPayService = globalPayServiceCreator.createService(
        globalPayServiceCreator.ENDPOINT_CAPTURE,
        token,
        { transactionId: transactionId }
    );

    var result = globalPayService.call({
        amount: '5000',
        capture_sequence: 'FIRST',
        total_capture_count: 0,
        payment_method: {
            card: {
                tag: 'string'
            }
        }
    });

    if (result.isOk()) {
        return result.object;
    }

    return null;
}

module.exports = {
    getPreferences: getPreferences,
    getAccessToken: getAccessToken,
    authenticate: authenticate,
    authorize: authorize,
    capture: capture
};
