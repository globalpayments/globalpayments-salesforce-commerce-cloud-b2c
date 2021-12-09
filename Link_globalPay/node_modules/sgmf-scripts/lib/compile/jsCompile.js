'use strict';
const webpack = require('webpack');
const webpackConfig = require('../utils/webpackConfig');

module.exports = (packageFile, cwd, callback) => {
    const jsConfig = webpackConfig(packageFile, cwd, 'js');
    if (typeof jsConfig === Error) {
        return;
    }

    // According to stats documentation this two values mean to not show stats output
    // @link https://webpack.js.org/configuration/stats/
    var hideStats = jsConfig.stats === false || jsConfig.stats === 'none';

    webpack(jsConfig, (err, stats) => {
        if (err) {
            console.error(err);
            callback(1);
            return;
        }
        if (!hideStats) {
            console.log(stats.toString(jsConfig.stats || {
                chunks: false,
                colors: true
            }));
        }
        callback(0);
    });
};
