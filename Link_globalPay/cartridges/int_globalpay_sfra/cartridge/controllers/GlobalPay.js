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
 * GlobalPay-Transactions : The GlobalPay-Transactions endpoint invokes transaction call
 * @name Base/GlobalPay-Transactions
 * @function
 * @memberof GlobalPay
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
 server.use('ThreeDs', function (req, res, next) {
  // service logic import
  // here we have invoke transaction call
      var test = "";
      res.setStatusCode(200);
      res.json({ success: 'true',message:'Successfully connect to Sfcc system.' }); 
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

module.exports = server.exports();
