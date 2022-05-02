'use strict';
var server = require('server');

/**
 * GlobalPay-Authorization : The GlobalPay-Authorization endpoint invokes authorization call from applepay
 * @name Base/GlobalPay-Authorization
 * @function
 * @memberof GlobalPay
 */
server.post('Authorization', server.middleware.https, function (req, res) {
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
  var creditCardUtils = require('*/cartridge/scripts/util/creditcardutils');
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
  var creditCardUtils = require('*/cartridge/scripts/util/creditcardutils');
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
  var reqEncodeFields = new Object();
  reqEncodeFields.serverTransID 	= cresJson.threeDSServerTransID;
  reqEncodeFields.acsTransID 	= cresJson.acsTransID;
  reqEncodeFields.challengeCompletionInd 	= cresJson.challengeCompletionInd;
  reqEncodeFields.messageType 		= cresJson.messageType;
  reqEncodeFields.messageVersion 		= cresJson.messageVersion;
  reqEncodeFields.transStatus 		= cresJson.transStatus;
  res.render('globalpay/chalangenotification',
    {
      reqcresEnoded: JSON.stringify(reqEncodeFields)
    });
  next();
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
