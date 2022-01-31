'use strict';

var server = require('server');

server.get('Show', function (req, res, next) {
  var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
  var paymentToken = 'PMT_1472a9b5-1a75-4dab-9668-3dd894bf6d3b';
  var authenticationData = {
    account_name: 'transaction_processing',
    channel: 'CNP',
    country: 'US',
    reference: '93459c79-f3f9-427d-84d9-ca0584bb55bf',
    amount: '1000',
    currency: 'USD',
    source: 'BROWSER',
    payment_method: {
      id: paymentToken
    },
    notifications:{
      challenge_return_url:"http://www.vacationtoplan.in/shopping/wc-api/globalpayments_threedsecure_challengenotification/",
      three_ds_method_return_url:"http://www.vacationtoplan.in/shopping/wc-api/globalpayments_threedsecure_methodnotification/"
   }
  };
    var authenticationTest = globalPayHelper.authenticate(authenticationData);
    var authorizationData = {
      account_name: 'transaction_processing',
      channel: 'CNP',
      capture_mode: 'LATER',
      type: 'SALE',
      amount: '5000',
      currency: 'USD',
      reference: '93459c79-f3f9-427d-84df-ca0584bb55bf',
      country: 'US',
      payment_method: {
        id: paymentToken,
        entry_mode: 'ECOM',
        authentication: {
          id: ''
        }
      }
    };

  var captureData = {
    transaction_id: 'TRN_t0cywQPpPAzFpiz5ZGskKtWIsfuHWE_ca0584bb55bf',
    amount: '5000',
    capture_sequence: 'FIRST',
    total_capture_count: 0,
    payment_method: {
      card: {
        tag: 'string'
      }
    }
  };

  var paypalData = {
    account_name: 'transaction_processing',
    channel: 'CNP',
    capture_mode: 'AUTO',
    type: 'SALE',
    amount: '2000',
    currency: 'USD',
    reference: '93459c79-f3f9-487c-84df-ca0584bb55bf',
    country: 'US',
    payment_method: {
      name: 'Doe',
      entry_mode: 'ECOM',
      apm: {
        provider: 'paypal'
      }
    },
    notifications: {
      return_url: 'http://testing.test/return',
      status_url: 'http://testing.test/status',
      cancel_url: 'http://testing.test/cancel'
    }
  };

  var threeDsStepOne = 
  {
     three_ds:{
        source:"BROWSER",
        preference:"NO_PREFERENCE"
     },
     auth_id : authenticationTest.id,
     method_url_completion_status:"YES",
     merchant_contact_url:"http://www.vacationtoplan.in/shopping/contact/",
     order:{
        time_created_reference:"2022-01-23T22:17:11.000000Z",
        amount:"999",
        currency:"EUR",
        address_match_indicator:true,
        shipping_address:{
           line1:"92 Scarcroft Road",
           city:"POOLEY BRIDGE",
           postal_code:"CA10 3EB",
           country:"826"
        }
     },
     payment_method:{
        id:paymentToken
     },
     browser_data:{
        accept_header:"*/*",
        color_depth:"TWENTY_FOUR_BITS",
        ip:"82.217.170.253",
        java_enabled:false,
        javascript_enabled:true,
        language:"en-US",
        screen_height:864,
        screen_width:1536,
        challenge_window_size:"WINDOWED_500X600",
        timezone:"-1",
        user_agent:"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36"
     }
  }

  var threeDsStepTwo = {
      auth_id : authenticationTest.id
  }
  var threeDsStepOneResp =  globalPayHelper.threeDsStepone(threeDsStepOne);
  var threeDsStepTwoResp =  globalPayHelper.threeDsSteptwo(threeDsStepTwo);
  res.json({
        // token: globalPayHelper.getAccessToken()
        // authenticationsReq:  authenticationData,
       //authentication: globalPayHelper.authenticate(authenticationData)
        // authReq:authorizationData,
        // authorization: globalPayHelper.authorize(authorizationData)
        // capture: globalPayHelper.capture(captureData)
       // paypal : globalPayHelper.paypal(paypalData)
       threeDsStepOne: threeDsStepOneResp,//globalPayHelper.authenticate(threeDsStepOne)
       threeDsStepTwoResp: threeDsStepTwoResp
  });
  next();
});

module.exports = server.exports();
