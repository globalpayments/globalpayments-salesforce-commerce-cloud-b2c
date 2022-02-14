'use strict';

var processInclude = require('base/util');

$(document).ready(function () {
  processInclude(require('./checkout/checkout'));
  processInclude(require('./googlepay/googlepay'));
  processInclude(require('./product/detail'));
});
