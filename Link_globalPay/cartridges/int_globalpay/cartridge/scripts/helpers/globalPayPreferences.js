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
    clientId: currentSite.getCustomPreferenceValue('gp_clientID'),
    env: currentSite.getCustomPreferenceValue('env'),
    threedsecureChallenge: currentSite.getCustomPreferenceValue('gp_threedsecure_challengenotification'), // http://testing.test/wc-api/globalpayments_threedsecure_challengenotification/
    threedsecureMethod: currentSite.getCustomPreferenceValue('gp_threedsecure_methodnotification'), // http://testing.test/wc-api/globalpayments_threedsecure_methodnotification/
    captureModeValue: currentSite.getCustomPreferenceValue('gp_captureModeValue')
  };
}

module.exports = {
  getPreferences: getPreferences
};
