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
  next();
});

/**
 * GlobalPay-ThreeDsMethod : The GlobalPay-Transactions endpoint invokes transaction call
 */
  server.use('ThreeDsMethod', function (req, res, next) {
    var StringUtils = require('dw/util/StringUtils');
    var decodedThreeDSMethodData = StringUtils.decodeBase64(req.querystring.threeDSMethodData);
    var decodedThreeDSMethodDataJSON = JSON.parse(decodedThreeDSMethodData);
    var serverTransID = decodedThreeDSMethodDataJSON.threeDSServerTransID;
    var serverTransIDEncoded = StringUtils.encodeBase64(serverTransID);
        res.render('globalpay/methodnotification',
        {
          serverTransID: serverTransIDEncoded
        });
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
    var cresJson = JSON.parse(req.form.cres);
    var reqEncodeFields = new Object();
   
    reqEncodeFields.serverTransID 	= cresJson.threeDSServerTransID;// // af65c369-59b9-4f8d-b2f6-7d7d5f5c69d5
    reqEncodeFields.acsTransID 	= cresJson.acsTransID;//13c701a3-5a88-4c45-89e9-ef65e50a8bf9
    reqEncodeFields.challengeCompletionInd 	= 'Y';// cresJson.challengeCompletionInd; // Y
    reqEncodeFields.messageType 		= 'CReq';//cresJson.messageType; // Cres
    reqEncodeFields.messageVersion 		= cresJson.messageVersion; // 2.1.0
    reqEncodeFields.transStatus 		= 'Y';//cresJson.transStatus; // Y

    var reqcresEnoded = StringUtils.encodeBase64(JSON.stringify(reqEncodeFields));
    res.render('globalpay/chalangenotification',
        {
          reqcresEnoded:reqcresEnoded 
        }); 
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

server.use('Authentication', function (req, res, next) {
  var globalPayPreferences = require('*/cartridge/scripts/helpers/globalPayPreferences');
  var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
  var preferences = globalPayPreferences.getPreferences();
  var globalpayconstants = require('*/cartridge/scripts/constants/globalpayconstants');
  var BasketMgr = require('dw/order/BasketMgr');
  var Locale = require('dw/util/Locale');
  var URLUtils = require('dw/web/URLUtils');
  var myreq = req;
  var currentBasket = BasketMgr.currentOrNewBasket; 
  var authenticationData = {
      account_name: globalpayconstants.authenticationData.account_name,
      channel: globalpayconstants.authenticationData.channel,
      country: Locale.getLocale(req.locale.id).country,
      reference: globalpayconstants.authorizationData.reference,
      amount: (currentBasket.totalGrossPrice.value * 100).toFixed(),
      currency: currentBasket.currencyCode,
      source: globalpayconstants.authenticationData.source,
      payment_method: {
        id: myreq.form.token//JSON.parse(req.body).card.reference
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
          reqAuthfields.enrolled = authentication.threeDs.enrolledStatus;
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

    //


  res.json({authentication: reqAuthfields});
  next();
});


server.use('Initiate', function (req, res, next) {
  var globalPayPreferences = require('*/cartridge/scripts/helpers/globalPayPreferences');
  var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
  var preferences = globalPayPreferences.getPreferences();
  var globalpayconstants = require('*/cartridge/scripts/constants/globalpayconstants');
  var BasketMgr = require('dw/order/BasketMgr');
  var Locale = require('dw/util/Locale');
  var basket = BasketMgr.currentOrNewBasket;
  /*
  var threeDsStepOne = 
    {
       three_ds:{
          source:globalpayconstants.threeDsStepOne.source,
          preference:globalpayconstants.threeDsStepOne.preference,
       },
       auth_id : authentication.id,
       method_url_completion_status:globalpayconstants.threeDsStepOne.method_url_completion_status,
       merchant_contact_url:globalpayconstants.threeDsStepOne.merchant_contact_url,
       order:{
          time_created_reference: (new Date()).toISOString(),
          amount: (basket.totalGrossPrice.value  * 100).toFixed(),
          currency:basket.currencyCode,
          address_match_indicator: globalpayconstants.threeDsStepOne.address_match_indicator,
          shipping_address:{
             line1:basket.shipments[0].shippingAddress.address1,
             city:basket.shipments[0].shippingAddress.city,
             postal_code:basket.shipments[0].shippingAddress.postalCode,
             country: globalpayconstants.threeDsStepOne.address_match_indicator
          }
       },
       payment_method:{
          id: req.form.storedPaymentUUID && req.currentCustomer.raw.authenticated && req.currentCustomer.raw.registered ? getTokenbyUUID(req, paymentInformation.paymentId.value) : paymentInformation.paymentId.value
       },
       browser_data:{
          accept_header:globalpayconstants.threeDsStepOne.accept_header, 
          color_depth: paymentInformation.threedsdata.value.colorDepth,
          ip: req.httpHeaders.get('true-client-ip'),
          java_enabled: paymentInformation.threedsdata.value.javaEnabled,
          javascript_enabled: globalpayconstants.threeDsStepOne.javascript_enabled,
          language:paymentInformation.threedsdata.value.browserLanguage,//"en-US",
          screen_height:paymentInformation.threedsdata.value.screenHeight,
          screen_width:paymentInformation.threedsdata.value.screenWidth,
          challenge_window_size: globalpayconstants.threeDsStepOne.challenge_window_size,
          timezone:paymentInformation.threedsdata.value.browserTime,
          user_agent:paymentInformation.threedsdata.value.userAgent
       }
    }
      var threeDsStepOneResp =  globalPayHelper.threeDsStepone(threeDsStepOne);
  
      if (!empty(threeDsStepOneResp) && !empty(threeDsStepOneResp.success) && !threeDsStepOneResp.success) {
        var serverErrors = [];
        serverErrors.push(threeDsStepOneResp.error.detailedErrorDescription);
        return { fieldErrors: [], serverErrors: serverErrors, error: true };
      }
  
*/

  res.json({status: 'success'});
  next();
});




module.exports = server.exports();
