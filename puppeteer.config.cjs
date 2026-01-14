const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
    // Changes the local cache path
    cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};