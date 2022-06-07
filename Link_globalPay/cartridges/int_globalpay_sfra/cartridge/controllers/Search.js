'use strict';

/**
 * @namespace Checkout
 */
/* eslint-disable */
var page = module.superModule;
var server = require('server');
server.extend(page);
var cache = require('*/cartridge/scripts/middleware/cache');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');

/**
 * Search-Show : This endpoint is called when a shopper type a query string in the search box
 * @name Base/Search-Show
 * @function
 * @memberof Search
 * @param {middleware} - cache.applyShortPromotionSensitiveCache
 * @param {middleware} - consentTracking.consent
 * @param {querystringparameter} - q - query string a shopper is searching for
 * @param {querystringparameter} - search-button
 * @param {querystringparameter} - lang - default is en_US
 * @param {querystringparameter} - cgid - Category ID
 * @param {category} - non-sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
 server.append('Show', cache.applyShortPromotionSensitiveCache, consentTracking.consent, function (req, res, next) {
    var viewData = res.getViewData();
    var apiProductSearch = viewData.apiProductSearch;
    var template = 'search/searchResults';
    if (apiProductSearch.category
        && apiProductSearch.category.template
        && apiProductSearch.categoryID == "apple-developer-merchantid-domain-association") {
        template = apiProductSearch.category.template;
    }

    res.render(template, {
        productSearch: viewData.productSearch,
        maxSlots: viewData.maxSlots,
        reportingURLs: viewData.reportingURLs,
        refineurl: viewData.refineurl,
        category: apiProductSearch.category ? apiProductSearch.category : null,
        canonicalUrl: viewData.canonicalUrl,
        schemaData: viewData.schemaData,
        apiProductSearch: viewData.apiProductSearch
    });

    return next();
}, pageMetaData.computedPageMetaData);


module.exports = server.exports();
