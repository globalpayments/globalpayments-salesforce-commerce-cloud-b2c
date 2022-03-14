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
  var globalPayPreferences = require('*/cartridge/scripts/helpers/globalPayPreferences');
  var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
  var preferences = globalPayPreferences.getPreferences();
  var globalpayconstants = require('*/cartridge/scripts/constants/globalpayconstants');
  var BasketMgr = require('dw/order/BasketMgr');
  var Locale = require('dw/util/Locale');
  var URLUtils = require('dw/web/URLUtils');
  var myreq = req;
  //var currentBasket =  BasketMgr.getBasket('139b43cf9419d4d1c13fc82acf');//getCurrentOrNewBasket(); 
  var storedBasket  = BasketMgr.getStoredBasket();
  var currentOrNewBasket  = BasketMgr.getCurrentOrNewBasket();
  var currentBasket = BasketMgr.getCurrentBasket();

  var body = JSON.parse(req.body);
  var authenticationData = {
      account_name: globalpayconstants.authenticationData.account_name,
      channel: globalpayconstants.authenticationData.channel,
      country: Locale.getLocale(req.locale.id).country,
      reference: globalpayconstants.authorizationData.reference,
      amount: body.card.cartData.amount,
      currency: currentBasket.currencyCode,
      source: globalpayconstants.authenticationData.source,
      payment_method: {
        id: JSON.parse(req.body).card.reference
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
        res.json({ 
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

      
     res.json(reqAuthfields);
  next();
});


server.use('Initiation', function (req, res, next) {
  var globalPayPreferences = require('*/cartridge/scripts/helpers/globalPayPreferences');
  var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
  var preferences = globalPayPreferences.getPreferences();
  var globalpayconstants = require('*/cartridge/scripts/constants/globalpayconstants');
  var BasketMgr = require('dw/order/BasketMgr');
  var Locale = require('dw/util/Locale');
  var URLUtils = require('dw/web/URLUtils');
  var basket = BasketMgr.getCurrentOrNewBasket(); 
  var body = JSON.parse(req.body);
  var browserData = JSON.parse(req.body).browserData;
  var challengeWindow = JSON.parse(req.body).challengeWindow;
        var threeDsStepOne = 
        {
          three_ds:{
              source:globalpayconstants.threeDsStepOne.source,
              preference:globalpayconstants.threeDsStepOne.preference,
          },
          auth_id :JSON.parse(req.body).authId,
          method_url_completion_status:globalpayconstants.threeDsStepOne.method_url_completion_status,
          merchant_contact_url:globalpayconstants.threeDsStepOne.merchant_contact_url,
          order:{
              time_created_reference: (new Date()).toISOString(),
              amount:body.card.cartData.amount,
              currency:basket.currencyCode,
              address_match_indicator: globalpayconstants.threeDsStepOne.address_match_indicator,
              shipping_address:{
                line1:body.card.cartData.address1,
                city:body.card.cartData.city,
                postal_code:body.card.cartData.postalcode,
                country:globalpayconstants.country
              }
          },
          payment_method:{
              id: JSON.parse(req.body).card.reference//req.form.storedPaymentUUID && req.currentCustomer.raw.authenticated && req.currentCustomer.raw.registered ? getTokenbyUUID(req, paymentInformation.paymentId.value) : paymentInformation.paymentId.value
          },


          browser_data:{
              accept_header:globalpayconstants.threeDsStepOne.accept_header, 
              color_depth: browserData.colorDepth,
              ip: req.httpHeaders.get('true-client-ip'),
              java_enabled:browserData.javaEnabled,
              javascript_enabled:browserData.javascriptEnabled,
              language:browserData.language,
              screen_height:browserData.screenHeight,
              language:browserData.language,
              screen_width:browserData.screenWidth,
              challenge_window_size:challengeWindow.windowSize,
              timezone:browserData.timezoneOffset,
              user_agent: browserData.userAgent
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

      res.json(threeDSResponse);
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