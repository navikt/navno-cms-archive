import puppeteer, { Browser } from 'puppeteer';
import { unlinkSync, existsSync } from 'fs';

const LAUNCH_ARGS = ['--no-sandbox', '--disable-setuid-sandbox', '--user-data-dir=/tmp/.chromium'];

// Chromium bruker singleton-filer for å hindre parallelle instanser mot samme
// userDataDir. Sletter dem eksplisitt før relansering slik at en død instans
// ikke blokkerer ny lansering (ellers: "browser is already running for /tmp/.chromium").
const clearChromiumLock = () => {
    [
        '/tmp/.chromium/SingletonLock',
        '/tmp/.chromium/SingletonSocket',
        '/tmp/.chromium/SingletonCookie',
    ]
        .filter(existsSync)
        .forEach((f) => {
            try {
                unlinkSync(f);
            } catch {
                // ignorer – filen kan allerede være borte
            }
        });
};

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
    private relaunching?: Promise<Browser>;

    private constructor(browser: Browser) {
        this.browser = browser;
    }

    public static async create(): Promise<BrowserManager> {
        return new BrowserManager(await puppeteer.launch({ args: LAUNCH_ARGS }));
    }

    public async getBrowser(): Promise<Browser> {
        if (this.browser.connected) {
            return this.browser;
        }

        // Flere samtidige kall (opptil BATCH_SIZE i én indekserings-batch) kan oppdage
        // frakoblingen samtidig. Del én relansering i stedet for å starte flere
        // Chromium-prosesser parallelt.
        if (!this.relaunching) {
            console.log('BrowserManager: Chromium-instans frakoblet, relanserer');
            this.relaunching = puppeteer.launch({ args: LAUNCH_ARGS }).then((browser) => {
                this.browser = browser;
                this.relaunching = undefined;
                return browser;
            });
        }

        return this.relaunching;
    }

    public async recycle(): Promise<void> {
        console.log('BrowserManager: resirkulerer Chromium-instans');
        try {
            await this.browser.close();
        } catch {
            // browseren kan allerede være død – ignorer og rens opp uansett
        }
        clearChromiumLock();
        this.browser = await puppeteer.launch({ args: LAUNCH_ARGS });
    }
}
