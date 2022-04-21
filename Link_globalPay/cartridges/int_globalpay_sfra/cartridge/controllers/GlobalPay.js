'use strict';
var server = require('server');

/**
 * GlobalPay-Authorization : The GlobalPay-Authorization endpoint invokes authorization call from applepay
 * @name Base/GlobalPay-Authorization
 * @function
 * @memberof GlobalPay
 */
 server.post('Authorization', function (req, res) {
  //Returning Success in the basic Auth method
  return { success: true }
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
server.use('Authentication', function (req, res, next) {
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
server.use('Initiation', function (req, res, next) {
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
server.use('ThreeDSSecureChallenge', function (req, res, next) {
      var StringUtils = require('dw/util/StringUtils');
      var cresDecode = StringUtils.decodeBase64(req.form.cres);
      var cresJson = JSON.parse(cresDecode);
      var reqEncodeFields = new Object();
     
      reqEncodeFields.serverTransID 	= cresJson.threeDSServerTransID;// // af65c369-59b9-4f8d-b2f6-7d7d5f5c69d5
      reqEncodeFields.acsTransID 	= cresJson.acsTransID;//13c701a3-5a88-4c45-89e9-ef65e50a8bf9
      reqEncodeFields.challengeCompletionInd 	=  cresJson.challengeCompletionInd; // Y
      reqEncodeFields.messageType 		= cresJson.messageType; // Cres
      reqEncodeFields.messageVersion 		= cresJson.messageVersion; // 2.1.0
      reqEncodeFields.transStatus 		= cresJson.transStatus; // Y
      res.render('globalpay/chalangenotification',
          {
            reqcresEnoded:JSON.stringify(reqEncodeFields)
          }); 
          next();
      });
      
server.use('ThreedsResp', function (req, res, next) {
  var creditCardUtils = require('*/cartridge/scripts/util/creditcardutils');
        var authentication=creditCardUtils.authenticationResult(req, res);
        res.json(authentication);
        return next();
});
/**
 * GlobalPay-ThreeDsMethod : The GlobalPay-Transactions endpoint invokes transaction call
 */
  server.use('ThreeDsMethod', function (req, res, next) {
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