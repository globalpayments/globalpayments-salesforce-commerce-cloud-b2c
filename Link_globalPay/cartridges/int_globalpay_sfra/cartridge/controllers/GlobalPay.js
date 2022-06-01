/* eslint-disable linebreak-style */
/* eslint-disable global-require */
'use strict';
var server = require('server');
var URLUtils = require('dw/web/URLUtils');
var Resource = require('dw/web/Resource');
var globalpayconstants = require('*/cartridge/scripts/constants/globalPayConstant');
/**
 * GlobalPay-Authorization : The GlobalPay-Authorization endpoint invokes
 * authorization call from applepay
 * @name Base/GlobalPay-Authorization
 * @function
 * @memberof GlobalPay
 */
server.post('Authorization', server.middleware.https, function () {
  // Returning Success in the basic Auth method
  return { success: true };
});

/**
 * GlobalPay-Authentication : The GlobalPay-Authentication endpoint invokes authentication call
 * @name Base/GlobalPay-Authentication
 * @function
 * @memberof GlobalPay
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - use
 */
server.use('Authentication', server.middleware.https, function (req, res, next) {
  var creditCardUtils = require('*/cartridge/scripts/util/creditCardUtils');
  var authentication = creditCardUtils.authenticationData(req, res);
  res.json(authentication);
  next();
});

/**
 * GlobalPay-Initiation : The GlobalPay-Initiation endpoint invokes Initiation call
 * @name Base/GlobalPay-Initiation
 * @function
 * @memberof GlobalPay
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - use
 */
server.use('Initiation', server.middleware.https, function (req, res, next) {
  var creditCardUtils = require('*/cartridge/scripts/util/creditCardUtils');
  var initiation = creditCardUtils.initiationData(req, res);
  res.json(initiation);
  next();
});


/**
* GlobalPay-ThreeSecureChallange : The GlobalPay-Transactions endpoint invokes transaction call
* @function
* @memberof GlobalPay
* @param {serverfunction} - post
*/
server.use('ThreeDSSecureChallenge', server.middleware.https, function (req, res, next) {
  var StringUtils = require('dw/util/StringUtils');
  var cresDecode = StringUtils.decodeBase64(req.form.cres);
  var cresJson = JSON.parse(cresDecode);
  var reqEncodeFields = {
    serverTransID: cresJson.threeDSServerTransID,
    acsTransID: cresJson.acsTransID,
    challengeCompletionInd: cresJson.challengeCompletionInd,
    messageType: cresJson.messageType,
    messageVersion: cresJson.messageVersion,
    transStatus: cresJson.transStatus
  };


  res.render('globalpay/chalangenotification',
    {
      reqcresEnoded: JSON.stringify(reqEncodeFields)
    });
  next();
});

/**
 * GlobalPay-ThreedsResp : Show response based on threeD authentication status
 */
server.use('ThreedsResp', server.middleware.https, function (req, res, next) {
  var creditCardUtils = require('*/cartridge/scripts/util/creditCardUtils');
  var authentication = creditCardUtils.getAuthenticationResult(req, res);
  if (!empty(authentication) && ('status' in authentication) &&
  authentication.status === globalpayconstants.AUTHRESPONSE) {
    res.redirect(URLUtils.https('Checkout-Begin', 'stage', 'placeOrder'));
  } else {
    res.redirect(URLUtils.https('Checkout-Begin', 'stage', 'payment',
    'payerAuthError', Resource.msg('checkout.card.payerAuthError', 'globalpay', null)));
  }
  return next();
});

/**
 * GlobalPay-ThreedsRedirect : Redirect to payer authentication page
 */
server.use('ThreedsRedirect', server.middleware.https, function (req, res, next) {
  res.render('globalpay/payerAuth',
    {
      authId: req.form.MD,
      paReq: req.form.PaReq,
      acsUrl: req.form.acsUrl
    });
  return next();
});
/**
 * GlobalPay-ThreeDsMethod : The GlobalPay-Transactions endpoint invokes transaction call
 */
server.use('ThreeDsMethod', server.middleware.https, function (req, res, next) {
  var StringUtils = require('dw/util/StringUtils');
  var decodedThreeDSMethodData = StringUtils.decodeBase64(req.form.threeDSMethodData);
  var decodedThreeDSMethodDataJSON = JSON.parse(decodedThreeDSMethodData);
  var serverTransID = decodedThreeDSMethodDataJSON.threeDSServerTransID;
  res.render('globalpay/methodnotification',
    {
      serverTransID: serverTransID
    });
  next();
});


module.exports = server.exports();
