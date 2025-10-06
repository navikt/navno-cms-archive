import { Browser } from 'puppeteer';
import { CmsArchiveContentService } from '../cms/CmsArchiveContentService';
import {
    generateErrorFilename,
    generatePdfFilename,
    generatePdfFooter,
    pixelWidthToA4Scale,
} from './pdf-utils';
import { CmsContent } from '../../../shared/cms-documents/content';
import archiver from 'archiver';
import { Response } from 'express';
import { DOWNLOAD_COOKIE_NAME } from '../../../shared/downloadCookie';
import { xmlToHtml } from '../../../shared/xmlToHtml';

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
            return res
                .status(400)
                .cookie(DOWNLOAD_COOKIE_NAME, false)
                .send('Version keys array must be non-empty');
        }

        const contentVersions = await this.contentService.getContentVersions(versionKeys);
        if (!contentVersions || contentVersions.length === 0) {
            return res
                .status(404)
                .cookie(DOWNLOAD_COOKIE_NAME, false)
                .send('No content versions found');
        }

        const newestVersion = contentVersions[0];
        const oldestVersion = contentVersions[contentVersions.length - 1];

        const zipFilename = `${newestVersion.name.slice(0, 50)}.zip`;

        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${encodeURIComponent(zipFilename)}"`
        )
            .setHeader('Content-Type', 'application/zip')
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
            if (!content.html && !content.xmlAsString) {
                continue;
            }

            await this.generateContentPdf(content, width).then((result) => {
                archive.append(result.data, { name: result.filename });
            });
        }

        archive.finalize();
    }

    public async generatePdfFromVersion(
        versionKey: string,
        width: number = DEFAULT_WIDTH_PX
    ): Promise<PdfResult | null> {
        const content = await this.contentService.getContentVersion(versionKey);
        if (!content) {
            return null;
        }

        return this.generateContentPdf(content, width);
    }

    private stripScriptTags(html: string): string {
        // Remove all script and iframe tags including their content
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<script\b[^>]*\/>/gi, '') // Handle self-closing script tags
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/<iframe\b[^>]*\/>/gi, ''); // Handle self-closing iframe tags
    }

    private async generateTableFromXML(content: CmsContent): Promise<string> {
        return await xmlToHtml({ content, fullHtmlDocument: true });
    }

    private async generateContentPdf(content: CmsContent, width: number): Promise<PdfResult> {
        console.log(`Preparing to generate PDF for content version ${content.versionKey}`);
        const { versionKey } = content;
        if (!content.html && !content.xmlAsString) {
            return {
                data: Buffer.from(
                    `Could not generate PDF from content version ${versionKey} - HTML and XML was empty`
                ),
                filename: generateErrorFilename(content),
            };
        }

        const html = content.html || (await this.generateTableFromXML(content));
        const widthActual = width >= MIN_WIDTH_PX ? width : DEFAULT_WIDTH_PX;

        // Strip script tags and accessible megamenu panels from HTML
        const htmlCleaned = this.stripScriptTags(html);

        // Ensures assets with relative urls are loaded from the correct origin
        const htmlWithBase = htmlCleaned.replace(
            '<head>',
            `<head><base href="${process.env.APP_ORIGIN_INTERNAL}"/>`
        );

        let page;
        try {
            console.log(`Starting PDF generation for version ${versionKey}`);

            page = await this.browser.newPage();

            // Enable request interception to debug network issues
            await page.setRequestInterception(true);

            // Log Page events for debugging should generation fail
            page.on('request', (request) => {
                console.log(
                    `Puppeteer: [${versionKey}] Request: ${request.method()} ${request.url()}`
                );
                request.continue();
            });

            page.on('requestfailed', (request) => {
                console.error(
                    `Puppeteer: [${versionKey}] Request failed: ${request.url()} - ${request.failure()?.errorText}`
                );
            });

            page.on('response', (response) => {
                console.log(
                    `Puppeteer: [${versionKey}] Response: ${response.status()} ${response.url()}`
                );
            });

            page.on('console', (msg) => {
                console.log(
                    `Puppeteer: [${versionKey}] Browser console: ${msg.type()} - ${msg.text()}`
                );
            });

            page.on('pageerror', (error) => {
                console.error(`Puppeteer: [${versionKey}] Page error:`, error);
            });

            console.log(`Page created successfully for version ${versionKey}`);

            await page.setViewport({ width: widthActual, height: 1024 });
            await page.emulateMediaType('screen');

            await page.setContent(htmlWithBase, {
                timeout: 30000, // 30 second timeout
            });

            // Wait for fonts
            try {
                await page.evaluateHandle('document.fonts.ready');
            } catch (fontError) {
                console.warn(`Font loading timeout for version ${versionKey}:`, fontError);
            }

            await page.addStyleTag({
                content: `
                div.panel-wrapper { display: none !important; }
            `,
            });

            console.log(`Generating PDF for version ${versionKey}`);
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
            console.log(`PDF generated for version ${versionKey}, size: ${pdf.length} bytes`);

            return {
                data: Buffer.from(pdf),
                filename: generatePdfFilename(content),
            };
        } catch (e) {
            const msg = `Error while generating PDF for content version ${versionKey} - ${e}`;
            console.error(msg);
            console.error('Full error stack:', e);
            return {
                data: Buffer.from(msg),
                filename: generateErrorFilename(content),
            };
        } finally {
            // Ensure page is always closed
            if (page) {
                try {
                    console.log(`Closing page for version ${versionKey}`);
                    await page.close();
                    console.log(`Page closed successfully for version ${versionKey}`);
                } catch (closeError) {
                    console.error(`Error closing page for version ${versionKey}:`, closeError);
                }
            }
        }
    }
}
