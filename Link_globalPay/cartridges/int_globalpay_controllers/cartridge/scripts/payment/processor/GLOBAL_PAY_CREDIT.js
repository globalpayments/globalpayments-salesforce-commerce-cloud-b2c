'use strict';

/* API Includes */
var PaymentMgr = require('dw/order/PaymentMgr');
var Transaction = require('dw/system/Transaction');
var Countries = require('app_storefront_core/cartridge/scripts/util/Countries');

/* Script Modules */
var globalpayconstants = require('*/cartridge/scripts/constants/globalpayconstants');
var app = require(globalpayconstants.APP);
var gpapp=require(globalpayconstants.GPAPP);
var Cart = app.getModel('Cart');
/**
 * Verifies a credit card against a valid card number and expiration date and possibly invalidates invalid form fields.
 * If the verification was successful a credit card payment instrument is created.
 */
function Handle(args) {
  var currentBasket = Cart.get(args.Basket);
  var creditCardForm = gpapp.getForm('billing.paymentMethods.creditCard');
  var PaymentMgr = require('dw/order/PaymentMgr');
  var cardErrors = {};
  var Locale = require('dw/util/Locale');
  var cardNumber = creditCardForm.get('number').value();
  var expirationMonth = creditCardForm.get('expiration.month').value();
  var expirationYear = creditCardForm.get('expiration.year').value();
  var serverErrors = [];
  var creditCardStatus;
  var cardType =creditCardForm.get('type').value();
  var paymentCard = PaymentMgr.getPaymentCard(cardType);
  var PaymentInstrument = require('dw/order/PaymentInstrument');
  var paymentMethodID= app.getForm('billing').object.paymentMethods.selectedPaymentMethodID.value

  currentBasket=currentBasket.object;
    // Validate payment instrument
    if (paymentMethodID === PaymentInstrument.METHOD_CREDIT_CARD) {
      var creditCardPaymentMethod = PaymentMgr.getPaymentMethod(PaymentInstrument.METHOD_CREDIT_CARD);
      var paymentCardValue = PaymentMgr.getPaymentCard(cardType);
     var countryCode = Countries.getCurrent({
        CurrentRequest: {
            locale: request.locale
        }
    }).countryCode;
      var applicablePaymentCards = creditCardPaymentMethod.getApplicablePaymentCards(
              customer,
              countryCode,
              null
          );
  
      if (!applicablePaymentCards.contains(paymentCardValue)) {
              // Invalid Payment Instrument
        var invalidPaymentMethod = Resource.msg('error.show.valid.payments', 'globalpay', null);
        return { fieldErrors: [], serverErrors: [invalidPaymentMethod], error: true };
      }
    }
   
    var globalPayPreferences = require('*/cartridge/scripts/helpers/globalPayPreferences');
    var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
    var preferences = globalPayPreferences.getPreferences();
    var paymentTokenId=creditCardForm.get('paymentId');
    var paymentId =null;
    if(!empty(paymentTokenId))
    {
      paymentTokenId=creditCardForm.get('paymentId').value();
    paymentId={
      value: JSON.parse(paymentTokenId).paymentReference,
      htmlName: JSON.parse(paymentTokenId).paymentReference
    };
  }
    var authenticationData = {
        account_name: globalpayconstants.authenticationData.account_name,
        channel: globalpayconstants.authenticationData.channel,
        country: 'US',
        reference: globalpayconstants.authorizationData.reference,
        amount: currentBasket.totalGrossPrice.value * 100,
        currency: currentBasket.currencyCode,
        source: globalpayconstants.authenticationData.source,
        payment_method: {
          id:  customer.authenticated && customer.registered ? getTokenbyUUID(request,paymentId.value ) : paymentId.value
        },
        notifications: {
          challenge_return_url: preferences.threedsecureChallenge,
          three_ds_method_return_url: preferences.threedsecureMethod
        }
      };
  
    var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
    var authentication = globalPayHelper.authenticate(authenticationData);
    if (!empty(authentication) && !empty(authentication.success) && !authentication.success) {
      var serverErrors = [];
      serverErrors.push(authentication.error.detailedErrorDescription);
      return { fieldErrors: [], serverErrors: serverErrors, error: true };
    }
     if(!empty(authentication.threeDs.methodData.threeDsServerTransId)){
      var paymentInformation=creditCardForm.get('threedsdata').value()?JSON.parse(creditCardForm.get('threedsdata').value()):"";
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
          time_created_reference:globalpayconstants.threeDsStepOne.time_created_reference,
          amount:currentBasket.merchandizeTotalGrossPrice.value * 100,
          currency:currentBasket.currencyCode,
          address_match_indicator: globalpayconstants.threeDsStepOne.address_match_indicator,
          shipping_address:{
             line1:currentBasket.shipments[0].shippingAddress.address1,
             city:currentBasket.shipments[0].shippingAddress.city,
             postal_code:currentBasket.shipments[0].shippingAddress.postalCode,
             country:"826"
          }
       },
       payment_method:{
          id: customer.authenticated && customer.registered ? getTokenbyUUID(request, paymentId.value) : paymentId.value
       },
       browser_data:{
          accept_header:globalpayconstants.threeDsStepOne.accept_header, 
          color_depth: paymentInformation.colorDepth,
          ip: request.httpHeaders.get('true-client-ip'),
          java_enabled: paymentInformation.javaEnabled,
          javascript_enabled: globalpayconstants.threeDsStepOne.javascript_enabled,
          language:paymentInformation.browserLanguage,//"en-US",
          screen_height:paymentInformation.screenHeight,
          screen_width:paymentInformation.screenWidth,
          challenge_window_size: globalpayconstants.threeDsStepOne.challenge_window_size,
          timezone:paymentInformation.browserTime,
          user_agent:paymentInformation.userAgent
       }
    }
        var threeDsStepOneResp =  globalPayHelper.threeDsStepone(threeDsStepOne);
    
        if (!empty(threeDsStepOneResp) && !empty(threeDsStepOneResp.success) && !threeDsStepOneResp.success) {
          var serverErrors = [];
          serverErrors.push(threeDsStepOneResp.error.detailedErrorDescription);
          return { fieldErrors: [], serverErrors: serverErrors, error: true };
        }
    
        var threeDsStepTwo = {
          auth_id : authentication.id
      }
    
      var threeDsStepTwoResp =  globalPayHelper.threeDsSteptwo(threeDsStepTwo);
      
      if (!empty(threeDsStepTwoResp) && !empty(threeDsStepTwoResp.success) && !threeDsStepTwoResp.success) {
        var serverErrors = [];
        serverErrors.push(threeDsStepTwoResp.error.detailedErrorDescription);
        return { fieldErrors: [], serverErrors: serverErrors, error: true };
      } 
     }
   
  
    Transaction.wrap(function () {
      var paymentInstruments = currentBasket.getPaymentInstruments(
              PaymentInstrument.METHOD_CREDIT_CARD
          );
        
        //  currentBasket.removeExistingPaymentInstruments(dw.order.PaymentInstrument.METHOD_CREDIT_CARD);
  
      var paymentInstrument = currentBasket.createPaymentInstrument(
              PaymentInstrument.METHOD_CREDIT_CARD, currentBasket.totalGrossPrice
          );
  
      paymentInstrument.setCreditCardHolder(currentBasket.billingAddress.fullName);
  
      paymentInstrument.custom.gp_authenticationid = authentication.id;
      paymentInstrument.custom.gp_paymentmethodid =  customer &&customer.registered ? getTokenbyUUID(req, paymentId.value) : paymentId.value;
      paymentInstrument.setCreditCardNumber(cardNumber);
      paymentInstrument.setCreditCardType(cardType);
      paymentInstrument.setCreditCardExpirationMonth(expirationMonth);
      paymentInstrument.setCreditCardExpirationYear(expirationYear);
      paymentInstrument.setCreditCardToken(authentication.id);
    });
    return {success: true};
}

function getTokenbyUUID(req, uuidToken) {
    var testcust = customer;
    var creditCardToken;
    testcust.wallet.paymentInstruments.forEach(function (each) {
      if (each.UUID == uuidToken) {
        creditCardToken = each.raw.creditCardToken;
        return each.raw.creditCardToken;
      }
    });
    return creditCardToken;
  }
/**
 * Authorizes a payment using a credit card. The payment is authorized by using the BASIC_CREDIT processor
 * only and setting the order no as the transaction ID. Customizations may use other processors and custom
 * logic to authorize credit card payment.
 */
function Authorize(args) {
    var orderNo = args.OrderNo;
    var order=args.Order;
    var paymentInstrument = args.PaymentInstrument;
    var paymentProcessor = PaymentMgr.getPaymentMethod(paymentInstrument.getPaymentMethod()).getPaymentProcessor();
    var Site = require('dw/system/Site');
    var currentSite = Site.getCurrent();
    var Locale = require('dw/util/Locale');
    var serverErrors = [];
    var fieldErrors = {};
    var error = false;
    var globalPayPreferences = require('*/cartridge/scripts/helpers/globalPayPreferences');
    var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
    var preferences = globalPayPreferences.getPreferences();
    var captureMode = preferences.captureMode;
    var authorizationData = {
      account_name: globalpayconstants.authorizationData.account_name,
      channel: globalpayconstants.authorizationData.channel,
      capture_mode: captureMode.value,
      type: globalpayconstants.authorizationData.type,
      amount: order.totalGrossPrice.value * 100,
      currency: order.currencyCode,
      reference: orderNo,
      country:'US',
      payment_method: {
        id: paymentInstrument.custom.gp_paymentmethodid,
        entry_mode: globalpayconstants.authorizationData.entrymode,
        authentication: {
          id: paymentInstrument.custom.gp_authenticationid
        }
      }
    };
    var authorization = globalPayHelper.authorize(authorizationData);
    if (!empty(authorization) && 'success' in authorization && !authorization.success) {
      var error = true;
      var serverErrors = [];
      if ('detailedErrorDescription' in authorization) { serverErrors.push(authorization.error.detailedErrorDescription); }
    } else {
      try {
        Transaction.wrap(function () {
          paymentInstrument.custom.gp_transactionid = authorization.id;
          paymentInstrument.paymentTransaction.setTransactionID(orderNo);
          paymentInstrument.paymentTransaction.setPaymentProcessor(paymentProcessor);
        });
      } catch (e) {
        error = true;
        serverErrors.push(
                  Resource.msg('error.technical', 'checkout', null)
              );
      }
    }
    return { fieldErrors: fieldErrors, serverErrors: serverErrors, error: error };
}

/*
 * Module exports
 */

/*
 * Local methods
 */
exports.Handle = Handle;
exports.Authorize = Authorize;
