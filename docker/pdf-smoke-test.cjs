// Chromium (unpinned apk) and puppeteer drift independently. A mismatch breaks PDF export with no
// usable error at runtime, so fail the image build instead of shipping it.
require('puppeteer')
    .launch({ args: ['--no-sandbox', '--disable-setuid-sandbox', '--user-data-dir=/tmp/.smoketest'] })
    .then(async (browser) => {
        const page = await browser.newPage();
        await page.setContent('<h1>smoke</h1>');
        const pdf = await page.pdf({ format: 'A4' });
        await browser.close();

        if (pdf.length < 1000) {
            throw new Error(`PDF suspiciously small: ${pdf.length} bytes`);
        }

        console.log(`PDF smoke test OK (${pdf.length} bytes)`);
    })
    .catch((e) => {
        console.error('PDF smoke test FAILED:', e.message);
        process.exit(1);
    });
