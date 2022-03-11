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
  var globalPayPreferences = require('*/cartridge/scripts/helpers/globalPayPreferences');
  var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
  var preferences = globalPayPreferences.getPreferences();
  var globalpayconstants = require('*/cartridge/scripts/constants/globalpayconstants');
  var BasketMgr = require('dw/order/BasketMgr');
  var Locale = require('dw/util/Locale');
  var URLUtils = require('dw/web/URLUtils');
  var myreq = request.httpParameterMap.requestBodyAsString;
  //var currentBasket =  BasketMgr.getBasket('139b43cf9419d4d1c13fc82acf');//getCurrentOrNewBasket(); 
  var storedBasket  = BasketMgr.getStoredBasket();
  var currentOrNewBasket  = BasketMgr.getCurrentOrNewBasket();
  var currentBasket = BasketMgr.getCurrentBasket();

  var body = JSON.parse(myreq);
  var authenticationData = {
      account_name: globalpayconstants.authenticationData.account_name,
      channel: globalpayconstants.authenticationData.channel,
      country: 'US',
      reference: globalpayconstants.authorizationData.reference,
      amount: body.card.cartData.amount,
      currency: currentBasket.currencyCode,
      source: globalpayconstants.authenticationData.source,
      payment_method: {
        id: JSON.parse(myreq).card.reference
      },
      notifications: {
        challenge_return_url: URLUtils.abs('GlobalPay-ThreeDSSecureChallenge').toString(),// preferences.threedsecureChallenge,
        three_ds_method_return_url:URLUtils.abs('GlobalPay-ThreeDsMethod').toString()// preferences.threedsecureMethod
      }
    };

  var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
    var authentication = globalPayHelper.authenticate(authenticationData);
      if (!empty(authentication) && !empty(authentication.success) && !authentication.success) {
        var serverErrors = [];
        serverErrors.push(authentication.error.detailedErrorDescription);     
        response.json({ 
                  authentication: authentication, 
                  serverErrors:serverErrors,
                  error: true
                });
       }
      //
      var reqAuthfields = new Object();
          reqAuthfields.enrolled = !empty(authentication.threeDs.enrolledStatus)?authentication.threeDs.enrolledStatus:'';
          reqAuthfields.methodData = authentication.threeDs.methodData.encodedMethodData;
          reqAuthfields.methodUrl = authentication.threeDs.methodUrl;
          reqAuthfields.serverTransactionId = authentication.threeDs.serverTransRef;
          reqAuthfields.versions = new Object();
          reqAuthfields.versions.accessControlServer = new Object();
          reqAuthfields.versions.accessControlServer.start = authentication.threeDs.acsProtocolVersionStart;
          reqAuthfields.versions.accessControlServer.end = authentication.threeDs.acsProtocolVersionEnd;
          reqAuthfields.versions.directoryServer = new Object();
          reqAuthfields.versions.directoryServer.start = authentication.threeDs.dsProtocolVersionStart;
          reqAuthfields.versions.directoryServer.end = authentication.threeDs.dsProtocolVersionEnd;
          reqAuthfields.id = authentication.id;
         
          responseUtils.renderJSON(
            reqAuthfields
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
  var globalPayPreferences = require('*/cartridge/scripts/helpers/globalPayPreferences');
  var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
  var preferences = globalPayPreferences.getPreferences();
  var globalpayconstants = require('*/cartridge/scripts/constants/globalpayconstants');
  var BasketMgr = require('dw/order/BasketMgr');
  var Locale = require('dw/util/Locale');
  var URLUtils = require('dw/web/URLUtils');
  var basket = BasketMgr.getCurrentOrNewBasket(); 
  var myreq=request.httpParameterMap.requestBodyAsString
  var body = JSON.parse(myreq);
  var browserData = JSON.parse(myreq).browserData;
  var challengeWindow = JSON.parse(myreq).challengeWindow;
        var threeDsStepOne = 
        {
          three_ds:{
              source:globalpayconstants.threeDsStepOne.source,
              preference:globalpayconstants.threeDsStepOne.preference,
          },
          auth_id :JSON.parse(myreq).authId,
          method_url_completion_status:globalpayconstants.threeDsStepOne.method_url_completion_status,
          merchant_contact_url:globalpayconstants.threeDsStepOne.merchant_contact_url,
          order:{
              time_created_reference: (new Date()).toISOString(),
              amount:body.card.cartData.amount,
              currency:basket.currencyCode,
              address_match_indicator: globalpayconstants.threeDsStepOne.address_match_indicator,
              shipping_address:{
                line1:body.card.cartData.address1,// basket.shipments[0].shippingAddress.address1,
                city:body.card.cartData.city,//basket.shipments[0].shippingAddress.city,
                postal_code:body.card.cartData.postalcode,//basket.shipments[0].shippingAddress.postalCode,
                country:globalpayconstants.country
              }
          },
          payment_method:{
              id: JSON.parse(myreq).card.reference//request.form.storedPaymentUUID && request.currentCustomer.raw.authenticated && request.currentCustomer.raw.registered ? getTokenbyUUID(req, paymentInformation.paymentId.value) : paymentInformation.paymentId.value
          },


          browser_data:{
              accept_header:globalpayconstants.threeDsStepOne.accept_header, 
              color_depth: browserData.colorDepth,//paymentInformation.threedsdata.value.colorDepth,
              ip: request.httpHeaders.get('true-client-ip'),
              java_enabled:browserData.javaEnabled,// paymentInformation.threedsdata.value.javaEnabled,
              javascript_enabled:browserData.javascriptEnabled,// globalpayconstants.threeDsStepOne.javascript_enabled,
              language:browserData.language,//paymentInformation.threedsdata.value.browserLanguage,//"en-US",
              screen_height:browserData.screenHeight,//paymentInformation.threedsdata.value.screenHeight,
              language:browserData.language,//paymentInformation.threedsdata.value.browserLanguage,//"en-US",
              screen_width:browserData.screenWidth,//paymentInformation.threedsdata.value.screenWidth,
              challenge_window_size:challengeWindow.windowSize,// globalpayconstants.threeDsStepOne.challenge_window_size,
              timezone:browserData.timezoneOffset,//paymentInformation.threedsdata.value.browserTime,
              user_agent: browserData.userAgent//'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36'//paymentInformation.threedsdata.value.userAgent
          }
        }

      var threeDsStepOneResp =  globalPayHelper.threeDsStepone(threeDsStepOne); 
      var threeDSResponse = new Object();
          threeDSResponse.acsTransactionId 			= threeDsStepOneResp.threeDs.acsTransRef;
          threeDSResponse.authenticationSource 			= threeDsStepOneResp.threeDs.authenticationSource;
          threeDSResponse.authenticationRequestType  		= threeDsStepOneResp.threeDs.messageCategory;
          threeDSResponse.cardholderResponseInfo  		= threeDsStepOneResp.threeDs.cardholderResponseInfo;
          threeDSResponse.challenge = new Object();
          threeDSResponse.challenge.encodedChallengeRequest 	= threeDsStepOneResp.threeDs.challengeValue;
          threeDSResponse.challenge.requestUrl  		= threeDsStepOneResp.threeDs.redirectUrl;
          threeDSResponse.challengeMandated  			= threeDsStepOneResp.threeDs.challengeStatus;
          threeDSResponse.deviceRenderOptions 			= threeDsStepOneResp.threeDs.authenticationSource; // need to discuss
          threeDSResponse.dsTransactionId  			= threeDsStepOneResp.threeDs.dsTransRef;
          threeDSResponse.messageCategory  			= threeDsStepOneResp.messageCategory;
          threeDSResponse.messageExtension 			= threeDsStepOneResp.threeDs.authenticationSource; // need to discuss
          threeDSResponse.messageVersion  			= threeDsStepOneResp.threeDs.messageVersion;
          threeDSResponse.mpi = new Object();
          threeDSResponse.mpi.authenticationValue 		=threeDsStepOneResp.threeDs.authenticationValue;
          threeDSResponse.mpi.eci  				= threeDsStepOneResp.threeDs.eci;
          threeDSResponse.serverTransactionId  			= threeDsStepOneResp.threeDs.serverTransRef;
          threeDSResponse.status  					= threeDsStepOneResp.threeDs.status;
          threeDSResponse.statusReason  				= threeDsStepOneResp.threeDs.statusReason;
          threeDSResponse.authID  					= threeDsStepOneResp.id;
          responseUtils.renderJSON(
            threeDSResponse
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
  
      var reqcresEnoded = StringUtils.encodeBase64(JSON.stringify(reqEncodeFields));
      app.getView({ 
        reqcresEnoded:reqcresEnoded 
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
  
 