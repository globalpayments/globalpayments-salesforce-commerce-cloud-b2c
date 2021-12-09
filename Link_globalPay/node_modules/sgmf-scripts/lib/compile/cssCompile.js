'use strict';

const webpack = require('webpack');
const webpackConfig = require('../utils/webpackConfig');

module.exports = (packageFile, cwd, callback) => {
    const scssConfig = webpackConfig(packageFile, cwd, 'scss');
    if (typeof scssConfig === Error) {
        return;
    }
    // According to stats documentation this two values mean to not show stats output
    // @link https://webpack.js.org/configuration/stats/
    var hideStats = scssConfig.stats === false || scssConfig.stats === 'none';

    webpack(scssConfig, (err, stats) => {
        if (err) {
            console.error(err);
            callback(1);
            return;
        }
        if (!hideStats) {
            console.log(stats.toString(scssConfig.stats || {
                chunks: false,
                colors: true
            }));
        }
        callback(0);
    });
};
