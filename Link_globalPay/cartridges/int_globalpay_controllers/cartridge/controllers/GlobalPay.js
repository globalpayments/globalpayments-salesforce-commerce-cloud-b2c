'use strict';
var page = module.superModule;
//var server = require('server');
/* Script Modules */
var globalpayconstants = require('*/cartridge/scripts/constants/globalpayconstants');


var guard = require(globalpayconstants.GUARD);
var gpapp = require(globalpayconstants.GPAPP);
var app = require(globalpayconstants.APP);

var responseUtils = require(globalpayconstants.SGRESPONSE);


/**
 * GlobalPay-Authentication : The GlobalPay-Authentications endpoint does the authentication
 * @name Base/GlobalPay-Authentications
 * @function
 * @memberof GlobalPay
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - get
 */
function Authentications() {
    // service logic import
  var globalPayHelper = require('int_globalpay/cartridge/scripts/helpers/globalPayHelper');
  var gpayResp = JSON.parse(request.querystring.gpayResp);
  var authenticate = globalPayHelper.authenticate();
  response.json({ success: true,
    authenticate: authenticate });
};
/**
 * GlobalPay-Authorization : The GlobalPay-Authorization endpoint invokes authorization call from applepay
 * @name Base/GlobalPay-Authorization
 * @function
 * @memberof GlobalPay
 */
function Authorization() {
  //Returning Success in the basic Auth method
  return { success: true }
};

/**
 * GlobalPay-Transactions : The GlobalPay-Transactions endpoint invokes transaction call
 * @name Base/GlobalPay-Transactions
 * @function
 * @memberof GlobalPay
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
function Transactions() {
    // service logic import
    // here we have invoke transaction call
  response.json({ success: 'true' });

};

/**
 * GlobalPay-Authentication : The GlobalPay-Authentications endpoint invoke the authentication
 * @name Base/GlobalPay-Authentications
 * @function
 * @memberof GlobalPay
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
function Authentication() {
  var creditCardUtils = require('*/cartridge/scripts/util/creditcardutils');
  var authentication = creditCardUtils.authenticationData(request, responseUtils);
          responseUtils.renderJSON(
            authentication
        );
};
/**
 * GlobalPay-Initiation : The GlobalPay-Initiation endpoint invoke  the initiation
 * @name Base/GlobalPay-Initiation
 * @function
 * @memberof GlobalPay
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
function Initiation() {
  var creditCardUtils = require('*/cartridge/scripts/util/creditcardutils');
  var initiation = creditCardUtils.initiationData(request, responseUtils);
          responseUtils.renderJSON(
            initiation
        );
};


    /**
 * GlobalPay-ThreeSecureChallange : The GlobalPay-Transactions endpoint invokes transaction call
  * @function
 * @memberof GlobalPay
 * @param {serverfunction} - post
 */
 function ThreeDSSecureChallenge() {
      var StringUtils = require('dw/util/StringUtils');
      var cresDecode = StringUtils.decodeBase64(request.httpParameterMap.cres);
      var cresJson = JSON.parse(cresDecode);
      var reqEncodeFields = new Object();
     
      reqEncodeFields.serverTransID 	= cresJson.threeDSServerTransID;// // af65c369-59b9-4f8d-b2f6-7d7d5f5c69d5
      reqEncodeFields.acsTransID 	= cresJson.acsTransID;//13c701a3-5a88-4c45-89e9-ef65e50a8bf9
      reqEncodeFields.challengeCompletionInd 	=  cresJson.challengeCompletionInd; // Y
      reqEncodeFields.messageType 		= cresJson.messageType; // Cres
      reqEncodeFields.messageVersion 		= cresJson.messageVersion; // 2.1.0
      reqEncodeFields.transStatus 		= cresJson.transStatus; // Y
  
     // var reqcresEnoded = StringUtils.encodeBase64(JSON.stringify(reqEncodeFields));
      app.getView({ 
        reqcresEnoded: JSON.stringify(reqEncodeFields)
    }).render('globalpay/chalangenotification');
 
      }
      
/**
 * GlobalPay-ThreeDsMethod : The GlobalPay-Transactions endpoint invokes transaction call
 */
function ThreeDsMethod() {
    var StringUtils = require('dw/util/StringUtils');
    var myreq=request.httpParameterMap;
 
    var decodedThreeDSMethodData = StringUtils.decodeBase64(myreq.threeDSMethodData);
    var decodedThreeDSMethodDataJSON = JSON.parse(decodedThreeDSMethodData);
    var serverTransID = decodedThreeDSMethodDataJSON.threeDSServerTransID;
        app.getView({ 
            serverTransID: serverTransID
        }).render('globalpay/methodnotification');
};

/**
 * GlobalPay-Transactions : The GlobalPay-Transactions endpoint invokes transaction call
 * @name Base/GlobalPay-Transactions
 * @function
 * @memberof GlobalPay
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
 function ThreeDs() {
  // service logic import
  // here we have invoke transaction call
      var test = "";
      response.setStatusCode(200);
      response.json({ success: 'true',message:'Successfully connect to Sfcc system.' }); 
    
  };

/**
 * GlobalPay-Capture : The GlobalPay-Capture endpoint invokes capture call
 * @name Base/GlobalPay-Capture
 * @function
 * @memberof GlobalPay
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
function Capture() {
    // service logic import
  response.json({ success: 'true' });
};

/*
* Module exports
*/

/*
* Web exposed methods
*/
 /* @see module:controllers/GlobalPay~Authentications */
 exports.Authentication = guard.ensure(['https'], Authentication);
 
 /* @see module:controllers/GlobalPay~Authorization */
 exports.Authorization = guard.ensure(['https'], Authorization);
 /* @see module:controllers/GlobalPay~Initiation */
 exports.Initiation = guard.ensure(['https'], Initiation);
 /* @see module:controllers/GlobalPay~ThreeDSSecureChallenge */
 exports.ThreeDSSecureChallenge = guard.ensure(['https'], ThreeDSSecureChallenge);
 /* @see module:controllers/GlobalPay~ThreeDsMethod */
 exports.ThreeDsMethod = guard.ensure(['https'], ThreeDsMethod);
/* @see module:controllers/GlobalPay~ThreeDsMethod */
exports.Capture = guard.ensure(['https'], Capture);
/* @see module:controllers/GlobalPay~ThreeDs */
exports.ThreeDs = guard.ensure(['https'], ThreeDs);
  
 