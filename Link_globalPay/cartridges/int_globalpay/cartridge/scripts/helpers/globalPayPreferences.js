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
        captureMode: currentSite.getCustomPreferenceValue('gp_captureMode'),
        clientId: currentSite.getCustomPreferenceValue('gp_clientID')
    };
}

module.exports = {
    getPreferences: getPreferences
};
