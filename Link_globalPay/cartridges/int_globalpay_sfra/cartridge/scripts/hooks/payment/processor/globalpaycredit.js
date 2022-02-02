'use strict';

var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
var collections = require('*/cartridge/scripts/util/collections');
var PaymentInstrument = require('dw/order/PaymentInstrument');
var PaymentMgr = require('dw/order/PaymentMgr');
var PaymentStatusCodes = require('dw/order/PaymentStatusCodes');
var Resource = require('dw/web/Resource');
var Transaction = require('dw/system/Transaction');
var globalpayconstants = require('*/cartridge/scripts/constants/globalpayconstants');
var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');

/**
 * Verifies the required information for billing form is provided.
 * @param {Object} req - The request object
 * @param {Object} paymentForm - the payment form
 * @param {Object} viewFormData - object contains billing form data
 * @returns {Object} an object that has error information or payment information
 */
function processForm(req, paymentForm, viewFormData) {
  var array = require('*/cartridge/scripts/util/array');

  var viewData = viewFormData;
  var creditCardErrors = {};

  if (Object.keys(creditCardErrors).length) {
    return {
      fieldErrors: creditCardErrors,
      error: true
    };
  }

  viewData.paymentMethod = {
    value: paymentForm.paymentMethod.value,
    htmlName: paymentForm.paymentMethod.value
  };

  viewData.paymentInformation = {
    cardType: {
      value: paymentForm.creditCardFields.cardType.value,
      htmlName: paymentForm.creditCardFields.cardType.htmlName
    },
    cardNumber: {
      value: paymentForm.creditCardFields.cardNumber.value,
      htmlName: paymentForm.creditCardFields.cardNumber.htmlName
    },
    expirationMonth: {
      value: parseInt(
                paymentForm.creditCardFields.expirationMonth.selectedOption,
                10
            ),
      htmlName: paymentForm.creditCardFields.expirationMonth.htmlName
    },
    expirationYear: {
      value: parseInt(paymentForm.creditCardFields.expirationYear.value, 10),
      htmlName: paymentForm.creditCardFields.expirationYear.htmlName
    }
  };

  if (req.form.storedPaymentUUID) {
    viewData.storedPaymentUUID = req.form.storedPaymentUUID;
  }

  viewData.saveCard = paymentForm.creditCardFields.saveCard.checked;

    // process payment information
  if (viewData.storedPaymentUUID
        && req.currentCustomer.raw.authenticated
        && req.currentCustomer.raw.registered
    ) {
    var paymentInstruments = req.currentCustomer.wallet.paymentInstruments;
    var paymentInstrument = array.find(paymentInstruments, function (item) {
      return viewData.storedPaymentUUID === item.UUID;
    });

    viewData.paymentInformation.cardNumber.value = paymentInstrument.creditCardNumber;
    viewData.paymentInformation.cardType.value = paymentInstrument.creditCardType;
    viewData.paymentInformation.expirationMonth.value = paymentInstrument.creditCardExpirationMonth;
    viewData.paymentInformation.expirationYear.value = paymentInstrument.creditCardExpirationYear;
    viewData.paymentInformation.creditCardToken = paymentInstrument.raw.creditCardToken;
  }

  return {
    error: false,
    viewData: viewData
  };
}

/**
 * Save the credit card information to login account if save card option is selected
 * @param {Object} req - The request object
 * @param {dw.order.Basket} basket - The current basket
 * @param {Object} billingData - payment information
 */
function savePaymentInformation(req, basket, billingData) {
  var CustomerMgr = require('dw/customer/CustomerMgr');

  if (!billingData.storedPaymentUUID
        && req.currentCustomer.raw.authenticated
        && req.currentCustomer.raw.registered
        && billingData.saveCard
        && (billingData.paymentMethod.value === globalpayconstants.reditCardPay.paymentMethod)
    ) {
    var customer = CustomerMgr.getCustomerByCustomerNumber(
            req.currentCustomer.profile.customerNo
        );

    var saveCardResult = COHelpers.savePaymentInstrumentToWallet(
            billingData,
            basket,
            customer
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
  var creditcardnumber = formdata.cardNumber;
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
  return tokenization.id;
}
  /**
   * Removes token. This should be replaced by utilizing a tokenization provider
   * @returns {string} a detokenize result
   */
function removeToken(creditcrdaToken) {
  var creditcardid = creditcrdaToken;
  var tokenizeData = {
    id: creditcrdaToken // CreditcardToken
  };
  var detokenization = globalPayHelper.detokenize(tokenizeData);
  return detokenization;
}


/**
 * Authorizes a payment using a credit card. Customizations may use other processors and custom
 *      logic to authorize credit card payment.
 * @param {number} orderNumber - The current order's number
 * @param {dw.order.PaymentInstrument} paymentInstrument -  The payment instrument to authorize
 * @param {dw.order.PaymentProcessor} paymentProcessor -  The payment processor of the current
 *      payment method
 * @return {Object} returns an error object
 */
function Authorize(orderNumber, paymentInstrument, paymentProcessor, req, order) {
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
    amount: order.merchandizeTotalGrossPrice.value * 100,
    currency: order.currencyCode,
    reference: orderNumber,
    country: Locale.getLocale(req.locale.id).country,
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
        paymentInstrument.paymentTransaction.setTransactionID(orderNumber);
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


function Handle(basket, paymentInformation, paymentMethodID, req) {
  var currentBasket = basket;
  var cardErrors = {};
  var Locale = require('dw/util/Locale');
  var cardNumber = paymentInformation.cardNumber.value;
  var expirationMonth = paymentInformation.expirationMonth.value;
  var expirationYear = paymentInformation.expirationYear.value;
  var serverErrors = [];
  var creditCardStatus;
  var cardType = paymentInformation.cardType.value;
  var paymentCard = PaymentMgr.getPaymentCard(cardType);
  var PaymentInstrument = require('dw/order/PaymentInstrument');


    // Validate payment instrument
  if (paymentMethodID === PaymentInstrument.METHOD_CREDIT_CARD) {
    var creditCardPaymentMethod = PaymentMgr.getPaymentMethod(PaymentInstrument.METHOD_CREDIT_CARD);
    var paymentCardValue = PaymentMgr.getPaymentCard(cardType);

    var applicablePaymentCards = creditCardPaymentMethod.getApplicablePaymentCards(
            req.currentCustomer.raw,
            req.geolocation.countryCode,
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

  var authenticationData = {
      account_name: globalpayconstants.authenticationData.account_name,
      channel: globalpayconstants.authenticationData.channel,
      country: Locale.getLocale(req.locale.id).country,
      reference: globalpayconstants.authorizationData.reference,
      amount: basket.merchandizeTotalGrossPrice.value * 100,
      currency: basket.currencyCode,
      source: globalpayconstants.authenticationData.source,
      payment_method: {
        id: req.form.storedPaymentUUID && req.currentCustomer.raw.authenticated && req.currentCustomer.raw.registered ? getTokenbyUUID(req, paymentInformation.paymentId.value) : paymentInformation.paymentId.value
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
          amount:basket.merchandizeTotalGrossPrice.value * 100,
          currency:basket.currencyCode,
          address_match_indicator: globalpayconstants.threeDsStepOne.address_match_indicator,
          shipping_address:{
             line1:basket.shipments[0].shippingAddress.address1,
             city:basket.shipments[0].shippingAddress.city,
             postal_code:basket.shipments[0].shippingAddress.postalCode,
             country:"826"
          }
       },
       payment_method:{
          id: req.form.storedPaymentUUID && req.currentCustomer.raw.authenticated && req.currentCustomer.raw.registered ? getTokenbyUUID(req, paymentInformation.paymentId.value) : paymentInformation.paymentId.value
       },
       browser_data:{
          accept_header:globalpayconstants.threeDsStepOne.accept_header, 
          color_depth:globalpayconstants.threeDsStepOne.color_depth,
          ip:globalpayconstants.threeDsStepOne.ip,
          java_enabled:globalpayconstants.threeDsStepOne.java_enabled,
          javascript_enabled:globalpayconstants.threeDsStepOne.javascript_enabled,
          language:"en-US",
          screen_height:globalpayconstants.threeDsStepOne.screen_height,
          screen_width:globalpayconstants.threeDsStepOne.screen_width,
          challenge_window_size:globalpayconstants.threeDsStepOne.challenge_window_size,
          timezone:globalpayconstants.threeDsStepOne.timezone,
          user_agent:globalpayconstants.threeDsStepOne.user_agent
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

    collections.forEach(paymentInstruments, function (item) {
      currentBasket.removePaymentInstrument(item);
    });

    var paymentInstrument = currentBasket.createPaymentInstrument(
            PaymentInstrument.METHOD_CREDIT_CARD, currentBasket.totalGrossPrice
        );

    paymentInstrument.setCreditCardHolder(currentBasket.billingAddress.fullName);

    paymentInstrument.custom.gp_authenticationid = authentication.id;
    paymentInstrument.custom.gp_paymentmethodid = req.form.storedPaymentUUID && req.currentCustomer.raw.authenticated && req.currentCustomer.raw.registered ? getTokenbyUUID(req, paymentInformation.paymentId.value) : paymentInformation.paymentId.value;
    paymentInstrument.setCreditCardNumber(cardNumber);
    paymentInstrument.setCreditCardType(cardType);
    paymentInstrument.setCreditCardExpirationMonth(expirationMonth);
    paymentInstrument.setCreditCardExpirationYear(expirationYear);
    paymentInstrument.setCreditCardToken(authentication.id);
  });
  return { fieldErrors: cardErrors, serverErrors: serverErrors, error: false };
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

exports.processForm = processForm;
exports.savePaymentInformation = savePaymentInformation;
exports.Authorize = Authorize;
exports.createToken = createToken;
exports.removeToken = removeToken;
exports.Handle = Handle;
