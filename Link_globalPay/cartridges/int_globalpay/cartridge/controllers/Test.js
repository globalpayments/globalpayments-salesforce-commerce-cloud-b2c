'use strict';

var server = require('server');

server.get('Show', function (req, res, next) {
    var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
    res.json({
        // token: globalPayHelper.getAccessToken(),
        // authentication: globalPayHelper.authenticate(),
        // authentication: globalPayHelper.authorize()
        authentication: globalPayHelper.capture('TRN_0surgUsNxMPQMGyuar8nj0HueOUscf_ca0584bb55bf')
    });
    next();
});

module.exports = server.exports();
