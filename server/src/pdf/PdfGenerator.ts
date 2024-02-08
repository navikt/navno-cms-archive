import { Browser } from 'puppeteer';
import { CmsArchiveContentService } from '../cms/CmsArchiveContentService';
import { generatePdfFilename, generatePdfFooter, pixelWidthToA4Scale } from './pdf-utils';
import { CmsContent } from '../../../common/cms-documents/content';
import archiver from 'archiver';
import { Response } from 'express';
import mime from 'mime';
import { DOWNLOAD_COOKIE_NAME } from '../../../common/downloadCookie';

const DEFAULT_WIDTH_PX = 1024;
const MIN_WIDTH_PX = 400;

type PdfResult = {
    data: Buffer;
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

    public async pdfFromVersionsResponse(
        versionKeys: string[],
        res: Response,
        width: number = DEFAULT_WIDTH_PX
    ) {
        if (versionKeys.length === 0) {
            return res.status(400).send();
        }

        const contentVersions = await this.contentService.getContentVersions(versionKeys);
        if (!contentVersions || contentVersions.length === 0) {
            return res.status(404).cookie(DOWNLOAD_COOKIE_NAME, false).send();
        }

        const newestVersion = contentVersions[0];
        const oldestVersion = contentVersions.slice(-1)[0];

        const zipFilename = `${newestVersion.name}_${newestVersion.meta.timestamp}-${oldestVersion.meta.timestamp}.zip`;

        res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`)
            .setHeader('Content-Type', mime.lookup(zipFilename) || 'application/octet-stream')
            .setHeader('Transfer-Encoding', 'chunked')
            .cookie(DOWNLOAD_COOKIE_NAME, true);

        const archive = archiver('zip');

        archive.on('data', (chunk) => {
            res.write(chunk);
        });

        archive.on('end', () => {
            res.end();
        });

        for (const content of contentVersions) {
            if (!content.html) {
                continue;
            }

            await this.generateContentPdf(content, width).then((pdf) => {
                if (!pdf) {
                    return;
                }

                if (!res.headersSent) {
                    // Set an estimate for content-length, which allows clients to track the download progress
                    // This header is not according to spec for chunked responses, but browsers seem to respect it
                    res.setHeader('Content-Length', pdf.length * contentVersions.length);
                }

                const fileName = generatePdfFilename(content);

                archive.append(pdf, { name: fileName });
            });
        }

        archive.finalize();
    }

    public async generatePdfFromVersion(
        versionKey: string,
        width: number = DEFAULT_WIDTH_PX
    ): Promise<PdfResult | null> {
        const content = await this.contentService.getContentVersion(versionKey);
        if (!content?.html) {
            return null;
        }

        const data = await this.generateContentPdf(content, width);
        if (!data) {
            return null;
        }

        return {
            data,
            filename: generatePdfFilename(content),
        };
    }

    private async generateContentPdf(content: CmsContent, width: number): Promise<Buffer | null> {
        const { html } = content;
        if (!html) {
            return null;
        }

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
                format: 'A4',
                scale: pixelWidthToA4Scale(widthActual),
                displayHeaderFooter: true,
                footerTemplate: generatePdfFooter(content),
                margin: {
                    top: '4px',
                    right: '4px',
                    bottom: '24px',
                    left: '4px',
                },
            });

            await page.close();

            return pdf;
        } catch (e) {
            console.error(`Error while generating PDF - ${e}`);
            return null;
        }
    }
}
