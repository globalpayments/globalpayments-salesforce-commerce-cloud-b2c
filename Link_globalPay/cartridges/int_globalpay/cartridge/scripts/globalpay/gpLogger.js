'use strict';

/**
 * Module for logging Digital River API requests/responses
 */
var Logger = require('dw/system/Logger');
var GLOBAL_PAY_LOG_NAME = 'GlobalPay';

module.exports = {
  getLogger: function (loggingCategory) { return Logger.getLogger(GLOBAL_PAY_LOG_NAME, loggingCategory); }
};
