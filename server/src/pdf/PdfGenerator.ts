import { Browser } from 'puppeteer';
import { CmsArchiveContentService } from '../cms/CmsArchiveContentService';
import JSZip from 'jszip';
import { pixelWidthToA4Scale } from './pdf-scale';
import { CmsContentDocument } from '../../../common/cms-documents/content';

const DEFAULT_WIDTH_PX = 1024;
const MIN_WIDTH_PX = 400;

type PdfResult = {
    data: Buffer;
    filename: string;
};

type ZipResult = {
    dataStream: NodeJS.ReadableStream;
    filename: string;
};

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

    public async generatePdfFromVersions(
        versionKeys: string[],
        width: number = DEFAULT_WIDTH_PX
    ): Promise<ZipResult | null> {
        if (versionKeys.length === 0) {
            return null;
        }

        const contentVersions = await this.contentService.getContentVersions(versionKeys);
        if (!contentVersions || contentVersions.length === 0) {
            return null;
        }

        const zip = JSZip();

        await Promise.all(
            contentVersions.map(async (content) => {
                if (!content.html) {
                    return;
                }

                const pdf = await this.generatePdf(content.html, width);
                if (!pdf) {
                    return;
                }

                const fileName = this.getPdfFilename(content);

                zip.file(fileName, pdf, { binary: true });
            })
        );

        const newestVersion = contentVersions[0];
        const oldestVersion = contentVersions.slice(-1)[0];

        const zipFilename = `${newestVersion.name}_${newestVersion.meta.timestamp}-${oldestVersion.meta.timestamp}.zip`;

        return {
            dataStream: zip.generateNodeStream(),
            filename: zipFilename,
        };
    }

    public async generatePdfFromVersion(
        versionKey: string,
        width: number = DEFAULT_WIDTH_PX
    ): Promise<PdfResult | null> {
        const content = await this.contentService.getContentVersion(versionKey);
        if (!content?.html) {
            return null;
        }

        const data = await this.generatePdf(content.html, width);
        if (!data) {
            return null;
        }

        return {
            data,
            filename: this.getPdfFilename(content),
        };
    }

    private async generatePdf(html: string, width: number): Promise<Buffer | null> {
        const widthActual = width >= MIN_WIDTH_PX ? width : DEFAULT_WIDTH_PX;

        // Ensures assets with relative urls are loaded from the correct origin
        const htmlWithBase = html.replace(
            '<head>',
            `<head><base href="${process.env.APP_ORIGIN}"/>`
        );

        try {
            const page = await this.browser.newPage();

            await page.setViewport({ width: widthActual, height: 1024 });
            await page.emulateMediaType('screen');
            await page.setContent(htmlWithBase);

            const pdf = await page.pdf({
                printBackground: true,
                format: 'a4',
                scale: pixelWidthToA4Scale(widthActual),
            });

            await page.close();

            return pdf;
        } catch (e) {
            console.error(`Error while generating PDF - ${e}`);
            return null;
        }
    }

    private getPdfFilename(content: CmsContentDocument) {
        return `${content.meta.timestamp}_${content.name}_${content.contentKey}-${content.versionKey}.pdf`;
    }
}
