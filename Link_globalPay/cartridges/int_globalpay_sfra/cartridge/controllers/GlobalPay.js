'use strict';
var page = module.superModule;
var server = require('server');


/**
 * redirect to threeds page
 */
server.get('Threeds', function (req, res, next) {
  res.render('globalpay/threeds');
  next();
});

/**
 * GlobalPay-Authentications : The GlobalPay-Authentications endpoint does the authentication
 * @name Base/GlobalPay-Authentications
 * @function
 * @memberof GlobalPay
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - get
 */
server.get('Authentications', function (req, res, next) {
    // service logic import
  var globalPayHelper = require('int_globalpay/cartridge/scripts/helpers/globalPayHelper');
  var gpayResp = JSON.parse(req.querystring.gpayResp);
  var authenticate = globalPayHelper.authenticate();
  res.json({ success: true,
    authenticate: authenticate });
  next();
});
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
 * GlobalPay-Transactions : The GlobalPay-Transactions endpoint invokes transaction call
 * @name Base/GlobalPay-Transactions
 * @function
 * @memberof GlobalPay
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.post('Transactions', function (req, res, next) {
    // service logic import
    // here we have invoke transaction call
  res.json({ success: 'true' });
  next();``
});

server.use('Authentication', function (req, res, next) {
  var creditCardUtils = require('*/cartridge/scripts/util/creditcardutils');
  var authentication = creditCardUtils.authenticationData(req, res);
  res.json(authentication);
  next();
});


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
  
     // var reqcresEnoded = StringUtils.encodeBase64(JSON.stringify(reqEncodeFields));
      res.render('globalpay/chalangenotification',
          {
            reqcresEnoded:JSON.stringify(reqEncodeFields)
          }); 
          next();
      });
      
/**
 * GlobalPay-ThreeDsMethod : The GlobalPay-Transactions endpoint invokes transaction call
 */
  server.use('ThreeDsMethod', function (req, res, next) {
    var StringUtils = require('dw/util/StringUtils');
    var decodedThreeDSMethodData = StringUtils.decodeBase64(req.form.threeDSMethodData);
    var decodedThreeDSMethodDataJSON = JSON.parse(decodedThreeDSMethodData);
    var serverTransID = decodedThreeDSMethodDataJSON.threeDSServerTransID;
   // var serverTransIDEncoded = StringUtils.encodeBase64(serverTransID);
        res.render('globalpay/methodnotification',
        {
          serverTransID: serverTransID
        });
        next();
    });

/**
 * GlobalPay-Transactions : The GlobalPay-Transactions endpoint invokes transaction call
 * @name Base/GlobalPay-Transactions
 * @function
 * @memberof GlobalPay
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
 server.use('ThreeDs', function (req, res, next) {
  // service logic import
  // here we have invoke transaction call
      var test = "";
      res.setStatusCode(200);
      res.json({ success: 'true',message:'Successfully connect to Sfcc system.' }); 
      next();
  });

/**
 * GlobalPay-Capture : The GlobalPay-Capture endpoint invokes capture call
 * @name Base/GlobalPay-Capture
 * @function
 * @memberof GlobalPay
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.post('Capture', function (req, res, next) {
    // service logic import
  res.json({ success: 'true' });
  next();
});

module.exports = server.exports();