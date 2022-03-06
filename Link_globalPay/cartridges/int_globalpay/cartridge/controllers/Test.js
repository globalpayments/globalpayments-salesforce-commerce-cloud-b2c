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
     payer: {
      reference: "6dcb24f5-74a0-4da3-98da-4f0aa0e88db3",
      account_age: "LESS_THAN_THIRTY_DAYS",
      account_creation_date: "2019-01-10",
      account_change_date: "2019-01-28",
      account_change_indicator: "THIS_TRANSACTION",
      account_password_change_date: "2019-01-15",
      account_password_change_indicator: "LESS_THAN_THIRTY_DAYS",
      home_phone: {
          country_code: "44",
          subscriber_number: "123456789"
      },
      work_phone: {
          country_code: "44",
          subscriber_number: "1801555888"
      },
      payment_account_creation_date: "2019-01-01",
      payment_account_age_indicator: "LESS_THAN_THIRTY_DAYS",
      suspicious_account_activity: "NO_SUSPICIOUS_ACTIVITY",
      purchases_last_6months_count: "03",
      transactions_last_24hours_count: "01",
      transaction_last_year_count: "05",
      provision_attempt_last_24hours_count: "01",
      shipping_address_time_created_reference: "2019-01-28",
      shipping_address_creation_indicator: "THIS_TRANSACTION"
  },
  payer_prior_three_ds_authentication_data: {
      authentication_method: "FRICTIONLESS_AUTHENTICATION",
      acs_transaction_reference: "26c3f619-39a4-4040-bf1f-6fd433e6d615",
      authentication_timestamp: "2020-07-28T10:26:49.712Z",
      authentication_data: "secret123"
  },
  recurring_authorization_data: {
      max_number_of_instalments: "05",
      frequency: "25",
      expiry_date: "2019-08-25"
  },
  payer_login_data: {
      authentication_data: "secret123",
      authentication_timestamp: "2020-07-28T10:26:49.712Z",
      authentication_type: "MERCHANT_SYSTEM_AUTHENTICATION"
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
  //var threeDsStepTwoResp =  globalPayHelper.threeDsSteptwo(threeDsStepTwo);
  var payPalCapture = {
    "transactionId":"TRN_M8DrlIDOGHrWohuqye84DWt3s9irKX_00003405"
  }
  //var payPalCaptureResp =  globalPayHelper.payPalCapture(payPalCapture);
  res.json({
    threeDsStepOneResp : threeDsStepOneResp
       
  });
  next();
});

module.exports = server.exports();
