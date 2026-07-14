import puppeteer, { Browser } from 'puppeteer';

const LAUNCH_ARGS = ['--no-sandbox', '--disable-setuid-sandbox', '--user-data-dir=/tmp/.chromium'];

// Delt eier av Chromium-instansen, brukt av både IndexingService og PdfService.
//
// Bakgrunn: under en lang backfill-kjøring (~9800 sider) ble én delt, langtlevende
// browser ustabil og krasjet hele prosessen (TargetCloseError fra puppeteer sin
// CDP-sesjon). getBrowser() relanserer automatisk hvis instansen har koblet fra, og
// recycle() lar en lang kjøring bytte browser periodisk. Fordi begge forbrukerne leser
// browseren via denne (ikke en fast referanse tatt ved konstruksjon), holder de seg
// synkronisert når den byttes ut.
export class BrowserManager {
    private browser: Browser;

    private constructor(browser: Browser) {
        this.browser = browser;
    }

    public static async create(): Promise<BrowserManager> {
        return new BrowserManager(await puppeteer.launch({ args: LAUNCH_ARGS }));
    }

    public async getBrowser(): Promise<Browser> {
        if (!this.browser.connected) {
            console.log('BrowserManager: Chromium-instans frakoblet, relanserer');
            this.browser = await puppeteer.launch({ args: LAUNCH_ARGS });
        }
        return this.browser;
    }

    public async recycle(): Promise<void> {
        console.log('BrowserManager: resirkulerer Chromium-instans');
        try {
            await this.browser.close();
        } catch {
            // browseren kan allerede være død – ignorer og relanser uansett
        }
        this.browser = await puppeteer.launch({ args: LAUNCH_ARGS });
    }
}
