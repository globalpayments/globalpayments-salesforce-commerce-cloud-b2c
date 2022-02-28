/**
 * Define the version of the Google Pay API referenced when creating your
 * configuration
 */
 const baseRequest = {
    apiVersion: 2,
    apiVersionMinor:  0
  };

  /**
   * Card networks supported by your site and your gateway
   */
   const allowedCardNetworks = ["AMEX", "DISCOVER", "INTERAC", "JCB", "MASTERCARD", "VISA"];

  /**
   * Card authentication methods supported by your site and your gateway
   * supported card networks
   */
   const allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];

  /**
   * Identify your gateway and your site's gateway merchant identifier
   *
   * The Google Pay API response will return an encrypted payment method capable
   * of being charged by a supported gateway after payer authorization
   */
   const tokenizationSpecification = {
    type: 'PAYMENT_GATEWAY',
    parameters: {
      'gateway': $('input[name=gpaymerchantname]').val(),
      'gatewayMerchantId': $('input[name=gatewayMerchantId]').val()
    }
  };

  /**
   * Describe your site's support for the CARD payment method and its required
   * fields
   */
  const baseCardPaymentMethod = {
    type: 'CARD',
    parameters: {
      allowedAuthMethods: allowedCardAuthMethods,
      allowedCardNetworks: allowedCardNetworks
    }
  };

  /**
   * Describe your site's support for the CARD payment method including optional
   * fields
   */
  const cardPaymentMethod = Object.assign(
    {},
    baseCardPaymentMethod,
    {
      tokenizationSpecification: tokenizationSpecification
    }
  );

  /**
   * An initialized google.payments.api.PaymentsClient object or null if not yet set
   */
  let paymentsClient = null;

  /**
   * Configure your site's support for payment methods supported by the Google Pay
   * API.
   *
   * Each member of allowedPaymentMethods should contain only the required fields,
   * allowing reuse of this base request when determining a viewer's ability
   * to pay and later requesting a supported payment method
   *
   * @returns {object} Google Pay API version, payment methods supported by the site
   */
  function getGoogleIsReadyToPayRequest() {
    return Object.assign(
        {},
        baseRequest,
        {
          allowedPaymentMethods: [baseCardPaymentMethod]
        }
    );
  }

  /**
   * Configure support for the Google Pay API
   * @returns {object} PaymentDataRequest fields
   */
  function getGooglePaymentDataRequest() {
    const paymentDataRequest = Object.assign({}, baseRequest);
    paymentDataRequest.allowedPaymentMethods = [cardPaymentMethod];
    paymentDataRequest.transactionInfo = getGoogleTransactionInfo();
    paymentDataRequest.merchantInfo = {
      // @todo a merchant ID is available for a production environment after approval by Google
       merchantId: $('input[name=gpaymerchantid]').val(),
      merchantName: $('input[name=gpayMerchantName]').val()
    };
    return paymentDataRequest;
  }

  /**
   * Return an active PaymentsClient or initialize
   * @returns {google.payments.api.PaymentsClient} Google Pay API client
   */
  function getGooglePaymentsClient() {
    if ( paymentsClient === null ) {
      paymentsClient = new google.payments.api.PaymentsClient({environment: $('input[name=gpayenv]').val()});
    }
    return paymentsClient;
  }

  /**
   * Add a Google Pay purchase button alongside an existing checkout button
   */
  function addGooglePayButton() {
    const paymentsClient = getGooglePaymentsClient();
    const button =
        paymentsClient.createButton({
          onClick: onGooglePaymentButtonClicked,
          allowedPaymentMethods: [baseCardPaymentMethod]
        });
    document.getElementById('google-pay-btn').appendChild(button);
  }
/**
   * Call googlePay button on click onGPay - RefArch
   */
 $('body').on('click', '.google-pay-tab', function () {
    if($('#google-pay-btn button').length==0){
        addGooglePayButton();
    }
});
/**
   * Call googlePay button on click onGPay - SiteGenesis
   */
 $('body').on('click', '#is-GP_DW_GOOGLE_PAY', function () {
     if($('#google-pay-btn button').length==0){
         addGooglePayButton();
     }
 });

  /**
   * Provide Google Pay API with a payment amount, currency, and amount status
   * @returns {object} transaction info, suitable for use as transactionInfo property of PaymentDataRequest
   */
   var totalPrice = $('.order-total .order-value').text()?$('.order-total .order-value').text().replace(/\$/g, ''):$('.grand-total-sum').text().replace(/\$/g, '')
  function getGoogleTransactionInfo() {
    return {
      countryCode: $('input[name=country]').val(),
      currencyCode:$('input[name=currency]').val(),
      totalPriceStatus: 'FINAL',
      // set to cart total
      totalPrice: totalPrice
    };
  }

  /**
   * Prefetch payment data to improve performance
   */
  function prefetchGooglePaymentData() {
    const paymentDataRequest = getGooglePaymentDataRequest();
    // transactionInfo must be set but does not affect cache
    paymentDataRequest.transactionInfo = {
      totalPriceStatus: 'NOT_CURRENTLY_KNOWN',
      currencyCode: $('input[name=currency]').val()
    };
    const paymentsClient = getGooglePaymentsClient();
    paymentsClient.prefetchPaymentData(paymentDataRequest);
  }

  /**
   * Show Google Pay payment sheet when Google Pay payment button is clicked
   */
  function onGooglePaymentButtonClicked() {
    const paymentDataRequest = getGooglePaymentDataRequest();
    paymentDataRequest.transactionInfo = getGoogleTransactionInfo();

    const paymentsClient = getGooglePaymentsClient();
    paymentsClient.loadPaymentData(paymentDataRequest)
        .then(function(paymentData) {
          // handle the response
          processPayment(paymentData);
        })
        .catch(function(err) {
        console.error(err);
        });
  }

   /**
   * Process payment data returned by the Google Pay API
   *
   * @param {object} paymentData response from Google Pay API after user approves payment
   */
    function processPayment(paymentData) {
      var sgSite = $('.order-total .order-value').text()?true:false;
      if(sgSite){
      $('input[name$=_paymentToken]').val(paymentData.paymentMethodData.tokenizationData.token);
      $('#dwfrm_billing').submit();
      }
      else{
     $('body').trigger('submit:googlepay',{paymentToken:paymentData.paymentMethodData.tokenizationData.token});
    }
  }
