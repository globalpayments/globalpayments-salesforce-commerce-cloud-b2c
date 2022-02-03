'use strict';
/**
 * getPreferences() function. Returns custom and hardcoded preferences
 *
 * @returns {Object} custom and hardcoded preferences
 */
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
    env: currentSite.getCustomPreferenceValue('gp_env'),
    threedsecureChallenge: currentSite.getCustomPreferenceValue('gp_threedsecure_challengenotification'), // http://testing.test/wc-api/globalpayments_threedsecure_challengenotification/
    threedsecureMethod: currentSite.getCustomPreferenceValue('gp_threedsecure_methodnotification'), // http://testing.test/wc-api/globalpayments_threedsecure_methodnotification/
    gpayMerchantId: currentSite.getCustomPreferenceValue('gp_gpayMerchantId'),
    gpayMerchantName: currentSite.getCustomPreferenceValue('gp_gpayMerchantName'),
    gpayEnv: currentSite.getCustomPreferenceValue('gp_gpayEnv'),
    gatewayMerchantId: currentSite.getCustomPreferenceValue('gp_gatewayMerchantId')
  };
}

module.exports = {
  getPreferences: getPreferences
};
