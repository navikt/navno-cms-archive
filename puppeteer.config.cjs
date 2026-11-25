const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
    // Changes the local cache path
    cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
    // CI builds don't run Puppeteer, and the Docker images use the Alpine chromium package
    skipDownload: process.env.CI === 'true',
};