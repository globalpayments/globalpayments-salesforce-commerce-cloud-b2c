'use strict';
var page = module.superModule;
var server = require('server');

server.get('Authentications', function(req, res, next){
    // service logic import 
    var globalPayHelper = require('int_globalpay/cartridge/scripts/helpers/globalPayHelper');
    var gpayResp = JSON.parse(req.querystring.gpayResp);
    var authenticate = globalPayHelper.authenticate();
    res.json({"success":true,
            "authenticate" : authenticate });
    next();
});

server.post('Transactions', function(req, res, next){
    // service logic import 
    //{"account_name":"transaction_processing","channel":"CNP","capture_mode":"LATER","type":"SALE","amount":"5000","currency":"USD","reference":"93459c79-f3f9-427d-84df-ca0584bb55bf","country":"US","payment_method":{"name":"Jane","entry_mode":"ECOM","card":{"number":"4242424242424242","expiry_month":"09","expiry_year":"22","cvv":"940","avs_address":"RD.asd's Bogong","avs_postal_code":"3699"}}}
   // here we have invoke transaction call
    res.json({"success":"true"});
    next();
});

server.post('Capture', function(req, res, next){
    // service logic import
    var test =  '';

    res.json({"success":"true"});
    next();
});

module.exports = server.exports();