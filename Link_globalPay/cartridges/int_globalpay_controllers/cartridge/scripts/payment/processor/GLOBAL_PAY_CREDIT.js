'use strict';

/* API Includes */
var PaymentMgr = require('dw/order/PaymentMgr');
var Transaction = require('dw/system/Transaction');
var Countries = require('app_storefront_core/cartridge/scripts/util/Countries');
var Resource = require('dw/web/Resource');

/* Script Modules */
var globalpayconstants = require('*/cartridge/scripts/constants/globalpayconstants');
var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
var globalPayPreferences = require('*/cartridge/scripts/helpers/globalPayPreferences');
var app = require(globalpayconstants.APP);
var gpapp=require(globalpayconstants.GPAPP);
var Cart = app.getModel('Cart');
var countryCode = Countries.getCurrent({
  CurrentRequest: {
      locale: request.locale
  }
}).countryCode;
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
  var cardType =creditCardForm.get('type').value();
  var PaymentInstrument = require('dw/order/PaymentInstrument');
  var paymentMethodID= app.getForm('billing').object.paymentMethods.selectedPaymentMethodID.value
  var saveCard=false;
  currentBasket=currentBasket.object;
    // Validate payment instrument
    if (paymentMethodID === PaymentInstrument.METHOD_CREDIT_CARD) {
      var creditCardPaymentMethod = PaymentMgr.getPaymentMethod(PaymentInstrument.METHOD_CREDIT_CARD);
      var paymentCardValue = PaymentMgr.getPaymentCard(cardType);
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
    var paymentTokenId=creditCardForm.get('paymentId').value();
    var paymentId =null;
    var uuid= request.httpParameterMap.creditCardUUID.value || request.httpParameterMap.dwfrm_billing_paymentMethods_creditCardList.stringValue;
    if(customer.authenticated&&customer.registered&&uuid)
    {
      saveCard=true;
      paymentId= {
        value: uuid,
        htmlName:uuid
      };
    }
    else if(!empty(paymentTokenId))
    {
    paymentId={
      value: JSON.parse(paymentTokenId).paymentReference,
      htmlName: JSON.parse(paymentTokenId).paymentReference
    };
  }

 var authenticationId=creditCardForm.get('authId').value();
 var isthreeds=creditCardForm.get('isthreeds').value();
     if(!empty(isthreeds)&&!empty(authenticationId)){
        var threeDsStepTwo = {
          auth_id : authenticationId
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

          for (var i = 0; i < paymentInstruments.length; i++) {
            var creditcard = paymentInstruments[i];
            currentBasket.removePaymentInstrument(creditcard);
        }

      var paymentInstrument = currentBasket.createPaymentInstrument(
              PaymentInstrument.METHOD_CREDIT_CARD, currentBasket.totalGrossPrice
          );

      paymentInstrument.setCreditCardHolder(currentBasket.billingAddress.fullName);
      paymentInstrument.custom.gp_authenticationid = authenticationId;
      paymentInstrument.custom.gp_paymentmethodid =  saveCard&&customer &&customer.registered ? getTokenbyUUID(request, paymentId.value) : paymentId.value;
      paymentInstrument.setCreditCardNumber(cardNumber);
      paymentInstrument.setCreditCardType(cardType);
      paymentInstrument.setCreditCardExpirationMonth(expirationMonth);
      paymentInstrument.setCreditCardExpirationYear(expirationYear);
      paymentInstrument.setCreditCardToken(authenticationId);
    });
    return {success: true};
}

function getTokenbyUUID(req, uuidToken) {
   var wallet = customer.getProfile().getWallet();
    var creditCardToken;
    for (var i = 0; i < wallet.paymentInstruments.length; i++) {
      var card = wallet.paymentInstruments[i];
      if (card.UUID === uuidToken) {
        creditCardToken = card.creditCardToken;
         return card.creditCardToken;
          break;
      }
  }
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
    var preferences = globalPayPreferences.getPreferences();
    var captureMode = preferences.captureMode;
    var authorizationData = {
      account_name: globalpayconstants.authorizationData.account_name,
      channel: globalpayconstants.authorizationData.channel,
      capture_mode: captureMode.value,
      type: globalpayconstants.authorizationData.type,
      amount: (order.totalGrossPrice.value * 100).toFixed(),
      currency: order.currencyCode,
      reference: orderNo,
      country: countryCode,
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
        serverErrors.push(authorization.error.detailedErrorDescription); 
      }
  else {
    if ('status' in authorization && authorization.status ==globalpayconstants.creditCardPay.declinedStatus) {
      var error = true;
      var serverErrors = [];
      serverErrors.push(Resource.msg('checkout.status.declined', 'globalpay', null));
    }
    else{
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
    }
    return { fieldErrors: fieldErrors, serverErrors: serverErrors, error: error };
}


/**
 * Save the credit card information to login account if save card option is selected
 * @param {Object} req - The request object
 * @param {dw.order.Basket} basket - The current basket
 * @param {Object} billingData - payment information
 */
 function savePaymentInformation( basket, billingData) {
  var CustomerMgr = require('dw/customer/CustomerMgr');

  if ( customer.authenticated&&customer.registered
        && billingData.saveCard
    ) {
    var customer = CustomerMgr.getCustomerByCustomerNumber(
            req.currentCustomer.profile.customerNo
        );
    var token = updateToken(billingData.paymentInformation.paymentId.value);
    var saveCardResult = COHelpers.savePaymentInstrumentToWallet(
            billingData,
            basket,
            customer,
            token
        );

    req.currentCustomer.wallet.paymentInstruments.push({
      creditCardHolder: saveCardResult.creditCardHolder,
      maskedCreditCardNumber: saveCardResult.maskedCreditCardNumber,
      creditCardType: saveCardResult.creditCardType,
      creditCardExpirationMonth: saveCardResult.creditCardExpirationMonth,
      creditCardExpirationYear: saveCardResult.creditCardExpirationYear,
      UUID: saveCardResult.UUID,
      creditCardNumber: Object.hasOwnProperty.call(
                saveCardResult,
                globalpayconstants.creditCardPay.CreditCardNumber
            )
                ? saveCardResult.creditCardNumber
                : null,
      raw: saveCardResult
    });
  }
}


/**
 * Creates a token. This should be replaced by utilizing a tokenization provider
 * @returns {string} a token
 */
 function createToken(formdata) {
  var expirymonth = formdata.expirationMonth >= 10 ? formdata.expirationMonth : '0' + formdata.expirationMonth;
  var expiryyear = formdata.expirationYear.toString().split('')[2] + formdata.expirationYear.toString().split('')[3];

  var tokenizeData = {
    usage_mode: globalpayconstants.authorizationData.usage_mode,
    reference: globalpayconstants.authorizationData.reference,
    first_name: formdata.name.split(' ')[0],
    last_name: formdata.name.split(' ')[1],
    card: {
      number: formdata.cardNumber,
      expiry_month: expirymonth,
      expiry_year: expiryyear
    },
    entry_mode: globalpayconstants.creditCardPay.entry_mode
  };
  var tokenization = globalPayHelper.tokenize(tokenizeData);
  return tokenization;
}

/**
 * Updates a token to usage mode Multiple. 
 * @returns {string} a token
 */
 function updateToken(paymentData) {
  var tokenizeData = {
    usage_mode: globalpayconstants.authorizationData.usage_mode,
    paymentInformationID : paymentData.paymentTokenID
  };
  var tokenization = globalPayHelper.updateTokenUsagemode(tokenizeData);
  if (!empty(tokenization) && !empty(tokenization.id)) {
    return tokenization;
  }else{
    tokenization.error
  }

}
/*
 * Module exports
 */
exports.Handle = Handle;
exports.Authorize = Authorize;
exports.CreateToken=createToken;
exports.UpdateToken=updateToken;

