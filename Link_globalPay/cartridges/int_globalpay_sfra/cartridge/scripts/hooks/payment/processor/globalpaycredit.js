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

   /* if (!req.form.storedPaymentUUID) {
        // verify credit card form data
        creditCardErrors = COHelpers.validateCreditCard(paymentForm);
    }*/

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
       /* securityCode: {
            value: paymentForm.creditCardFields.securityCode.value,
            htmlName: paymentForm.creditCardFields.securityCode.htmlName
        },*/
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
       // viewData.paymentInformation.securityCode.value = req.form.securityCode;
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
        && (billingData.paymentMethod.value === 'CREDIT_CARD')
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
                'creditCardNumber'
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
      /*  return Math.random().toString(36).substr(2);*/
    var tokenizeData = {
      usage_mode: "MULTIPLE", //    'transaction_processing',
      reference: '93459c79-f3f9-427d-84d9-ca0584bb55bf',
      first_name: formdata.name.split(' ')[0],
      last_name: formdata.name.split(' ')[1],
      card: {
        number: formdata.cardNumber,
        expiry_month: expirymonth,
        expiry_year: expiryyear
      },
      entry_mode: "ECOM"
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
        account_name: globalpayconstants.authorizationData.account_name,//'transaction_processing',
        channel: globalpayconstants.authorizationData.channel,
        capture_mode: captureMode.value,
        type: globalpayconstants.authorizationData.type,
        amount: Math.ceil(order.merchandizeTotalGrossPrice.value),//'5000', 
        currency: order.currencyCode,
        reference: orderNumber,
        country: Locale.getLocale(req.locale.id).country,
        payment_method: {
             id : paymentInstrument.custom.gp_paymentmethodid,
             entry_mode: "ECOM",
             authentication:{
                 id : paymentInstrument.custom.gp_authenticationid
             }
        }
    } 
    var authorization = globalPayHelper.authorize(authorizationData);
    if(!empty(authorization) && 'success' in  authorization && !authorization.success){
        var error = true;
        var serverErrors = [];
        if('detailedErrorDescription' in authorization)
        serverErrors.push(authorization.error.detailedErrorDescription);
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
    var cardNumber =  paymentInformation.cardNumber.value;
   //var cardSecurityCode =  paymentInformation.securityCode.value;
    var expirationMonth = paymentInformation.expirationMonth.value;
    var expirationYear =  paymentInformation.expirationYear.value;
    var serverErrors = [];
    var creditCardStatus;
    var cardType =   paymentInformation.cardType.value;
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

    /*
    if (!paymentInformation.creditCardToken) {
        if (paymentCard) {
            creditCardStatus = paymentCard.verify(
                expirationMonth,
                expirationYear,
                cardNumber,
                cardSecurityCode
            );
        } else {
            cardErrors[paymentInformation.cardNumber.htmlName] =
                Resource.msg('error.invalid.card.number', 'creditCard', null);

            return { fieldErrors: [cardErrors], serverErrors: serverErrors, error: true };
        }

        if (creditCardStatus.error) {
            collections.forEach(creditCardStatus.items, function (item) {
                switch (item.code) {
                    case PaymentStatusCodes.CREDITCARD_INVALID_CARD_NUMBER:
                        cardErrors[paymentInformation.cardNumber.htmlName] =
                            Resource.msg('error.invalid.card.number', 'creditCard', null);
                        break;

                    case PaymentStatusCodes.CREDITCARD_INVALID_EXPIRATION_DATE:
                        cardErrors[paymentInformation.expirationMonth.htmlName] =
                            Resource.msg('error.expired.credit.card', 'creditCard', null);
                        cardErrors[paymentInformation.expirationYear.htmlName] =
                            Resource.msg('error.expired.credit.card', 'creditCard', null);
                        break;

                    case PaymentStatusCodes.CREDITCARD_INVALID_SECURITY_CODE:
                        cardErrors[paymentInformation.securityCode.htmlName] =
                            Resource.msg('error.invalid.security.code', 'creditCard', null);
                        break;
                    default:
                        serverErrors.push(
                            Resource.msg('error.card.information.error', 'creditCard', null)
                        );
                }
            });

            return { fieldErrors: [cardErrors], serverErrors: serverErrors, error: true };
        }
    }
 */
    var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');

    var authenticationData = {
        account_name: globalpayconstants.authenticationData.account_name,
        channel: globalpayconstants.authenticationData.channel,
        country: Locale.getLocale(req.locale.id).country,
        reference: '93459c79-f3f9-427d-84d9-ca0584bb55bf',
        amount: Math.ceil(basket.merchandizeTotalGrossPrice.value),
        currency: basket.currencyCode,
        source: globalpayconstants.authenticationData.source,
        payment_method: {
            id: req.form.storedPaymentUUID && req.currentCustomer.raw.authenticated && req.currentCustomer.raw.registered ? paymentInformation.creditCardToken : paymentInformation.paymentId.value
        },
        notifications: {
            challenge_return_url: 'http://testing.test/wc-api/globalpayments_threedsecure_challengenotification/',
            three_ds_method_return_url: 'http://testing.test/wc-api/globalpayments_threedsecure_methodnotification/'
        }
    };

    var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
    var authentication = globalPayHelper.authenticate(authenticationData); 
    if(!empty(authentication) && !empty(authentication.success) && !authentication.success ){
        var serverErrors = [];
            serverErrors.push(authentication.error.detailedErrorDescription);
        return { fieldErrors: [], serverErrors: serverErrors, error: true };
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
        //paymentInstrument.setCreditCardToken(paymentInformation.creditCardToken? paymentInformation.creditCardToken: createToken());
        paymentInstrument.setCreditCardToken(authentication.id); 
    });
    return { fieldErrors: cardErrors, serverErrors: serverErrors, error: false};
}

function getTokenbyUUID(req, uuidToken){
    var testcust = req.currentCustomer;
    var creditCardToken;
    testcust.wallet.paymentInstruments.forEach(function(each){
        if(each.UUID == uuidToken){
            creditCardToken = each.raw.creditCardToken;
            return each.raw.creditCardToken;
        }
        
    })  
    return creditCardToken;
}

exports.processForm = processForm;
exports.savePaymentInformation = savePaymentInformation;
exports.Authorize = Authorize;
exports.createToken = createToken;
exports.removeToken = removeToken;
exports.Handle = Handle
