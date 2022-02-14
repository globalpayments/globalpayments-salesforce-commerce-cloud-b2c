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
   const supportedNetworks = ["AMEX", "DISCOVER", "INTERAC", "JCB", "MASTERCARD", "VISA"];

   /**
    * Merchant Capabilities to support payment methods within applepay
    * 
    */
  
  const merchantcapabilities = ['supports3DS']



  function validateMerchant(event)
  {
    var data={
      displayName: 'merchant.com.mindtree',
      domainName: 'zzkf-020.sandbox.us01.dx.commercecloud.salesforce.com',
      validationUrl: event.validationURL
    };
    return Promise.resolve($.ajax({
      type: 'POST',
      url: event.validationUrl,
      data: data
    })).then(function (response) {
    // handle error in the response
    if (response.error) {
    throw new Error(response.error);
    } else {
    return response;
    }
  });
  }
  
  /**
   * Applepay button Clickevent to trigger the apple session 
   * 
   */
$('apple-pay-button').on('click',function(){
  alert(123);
  var request = {
    countryCode: 'US',
    currencyCode: 'USD',
    supportedNetworks: supportedNetworks,
    merchantCapabilities: merchantcapabilities,
    total: { label: 'merchant.com.mindtree', amount: '10.00' },
  }
  var session = new ApplePaySession(8, request);
  alert('test');
  session.onvalidatemerchant = function(event) {
    alert(event);
    var merchantSession = validateMerchant(event);
    session.completeMerchantValidation(merchantSession);
  }; 

});


  