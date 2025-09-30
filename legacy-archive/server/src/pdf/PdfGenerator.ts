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
            if (!content.html) {
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
        if (!content?.html) {
            return null;
        }

        return this.generateContentPdf(content, width);
    }

    private async generateContentPdf(content: CmsContent, width: number): Promise<PdfResult> {
        const { html, versionKey } = content;
        if (!html) {
            return {
                data: Buffer.from(
                    `Could not generate PDF from content version ${versionKey} - HTML field was empty`
                ),
                filename: generateErrorFilename(content),
            };
        }

        const widthActual = width >= MIN_WIDTH_PX ? width : DEFAULT_WIDTH_PX;

        // Ensures assets with relative urls are loaded from the correct origin
        const htmlWithBase = html.replace(
            '<head>',
            `<head><base href="${process.env.APP_ORIGIN_INTERNAL}"/>`
        );

        let page;
        try {
            console.log(`Starting PDF generation for version ${versionKey}`);
            
            // Step 1: Create page
            console.log(`Creating new page for version ${versionKey}`);
            page = await this.browser.newPage();
            console.log(`Page created successfully for version ${versionKey}`);

            // Step 2: Set viewport and media type
            console.log(`Setting viewport and media type for version ${versionKey}`);
            await page.setViewport({ width: widthActual, height: 1024 });
            await page.emulateMediaType('screen');
            console.log(`Viewport and media type set for version ${versionKey}`);

            console.log(htmlWithBase);
            
            // Step 3: Set content with timeout handling
            console.log(`Setting page content for version ${versionKey}`);
            try {
                await page.setContent(htmlWithBase, { 
                    waitUntil: 'networkidle0',
                    timeout: 30000 // 30 second timeout
                });
                console.log(`Page content set successfully for version ${versionKey}`);
            } catch (contentError) {
                console.error(`Timeout/error setting content for version ${versionKey}:`, contentError);
                // Try with a more lenient wait condition
                console.log(`Retrying with domcontentloaded for version ${versionKey}`);
                await page.setContent(htmlWithBase, { 
                    waitUntil: 'domcontentloaded',
                    timeout: 15000
                });
                console.log(`Page content set with domcontentloaded for version ${versionKey}`);
            }

            // Step 4: Wait for fonts and additional resources
            console.log(`Waiting for fonts and additional resources for version ${versionKey}`);
            try {
                await Promise.race([
                    page.evaluateHandle('document.fonts.ready'),
                    page.waitForNetworkIdle({ idleTime: 2000})
                ]);
                console.log(`Fonts loaded for version ${versionKey}`);
            } catch (fontError) {
                console.warn(`Font loading timeout for version ${versionKey}:`, fontError);
            }

            // Give a bit more time for rendering
            await page.waitForTimeout(1000);
            console.log(`Additional render time completed for version ${versionKey}`);

            // Step 5: Generate PDF
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
            console.log(`PDF generated successfully for version ${versionKey}`);

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
