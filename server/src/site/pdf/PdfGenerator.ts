import { Browser } from 'puppeteer';
import { CmsArchiveContentService } from '../../cms/CmsArchiveContentService';

type ConstructorProps = {
    browser: Browser;
    contentService: CmsArchiveContentService;
};

export class PdfGenerator {
    private readonly browser: Browser;
    private readonly contentService: CmsArchiveContentService;

    constructor({ browser, contentService }: ConstructorProps) {
        this.browser = browser;
        this.contentService = contentService;
    }

    public async generatePdfFromVersions(versionKeys: string[]) {
        if (versionKeys.length === 0) {
            return null;
        }

        const contentVersions = await this.contentService.getContentVersions(versionKeys);
        if (!contentVersions || contentVersions.length === 0) {
            return null;
        }

        const pdfs: Buffer[] = [];

        await Promise.all(
            contentVersions.map(async (content) => {
                if (!content.html) {
                    return;
                }

                pdfs.push(await this.generatePdf(content.html));
            })
        );

        return pdfs;
    }

    private async generatePdf(html: string): Promise<Buffer> {
        const page = await this.browser.newPage();

        await page.setContent(html);
        await page.emulateMediaType('screen');

        const pdf = await page.pdf();

        page.close();

        return pdf;
    }
}
