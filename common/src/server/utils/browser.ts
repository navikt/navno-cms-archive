import puppeteer, { Browser } from 'puppeteer';

const LAUNCH_OPTIONS = {
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--user-data-dir=/tmp/.chromium'],
};

let browser: Browser | undefined;
let pendingLaunch: Promise<Browser> | undefined;

// The browser is shared by every PDF request. Without this check a single crash would leave PDF
// export dead until the pod restarts.
export const getBrowser = async (): Promise<Browser> => {
    if (browser?.connected) {
        return browser;
    }

    if (!pendingLaunch) {
        pendingLaunch = puppeteer
            .launch(LAUNCH_OPTIONS)
            .then((newBrowser) => {
                browser = newBrowser;
                return newBrowser;
            })
            .finally(() => {
                pendingLaunch = undefined;
            });
    }

    return pendingLaunch;
};
