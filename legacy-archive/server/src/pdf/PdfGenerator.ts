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

        const zipFilename = `${newestVersion.name}_${oldestVersion.meta.timestamp}-${newestVersion.meta.timestamp}.zip`;

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
        width: number = DEFAULT_WIDTH_PX,
        req?: Request
    ): Promise<PdfResult | null> {
        const content = await this.contentService.getContentVersion(versionKey);
        if (!content?.html) {
            return null;
        }

        return this.generateContentPdf(content, width, req);
    }

    private async generateContentPdf(
        content: CmsContent,
        width: number,
        req?: Express.Request
    ): Promise<PdfResult> {
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

        // Remove header and footer in print
        // const htmlWithoutHeaderAndFooter = html.replaceAll(
        //     /(<header([^;]*)<\/header>|<footer([^;]*)<\/footer>)/g,
        //     ''
        // );

        // Ensures assets with relative urls are loaded from the correct origin
        const htmlWithBase = html.replace(
            '<head>',
            `<head><base href="${process.env.APP_ORIGIN_INTERNAL}"/>`
        );

        console.log(htmlWithBase);

        try {
            const page = await this.browser.newPage();

            if (req) {
                // Forward cookies
                if (req.headers.cookie) {
                    const cookies = req.headers.cookie.split(';').map((cookieStr) => {
                        const [name, ...rest] = cookieStr.trim().split('=');
                        return {
                            name,
                            value: rest.join('='),
                            domain: req.hostname, // adjust if needed
                        };
                    });
                    await page.setCookie(...cookies);
                }
                // Forward headers (e.g., Authorization)
                const extraHeaders: Record<string, string> = {};
                if (req.headers.authorization) {
                    extraHeaders['authorization'] = req.headers.authorization;
                }
                // Add more headers as needed
                if (Object.keys(extraHeaders).length > 0) {
                    await page.setExtraHTTPHeaders(extraHeaders);
                }
            }

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

            return {
                data: Buffer.from(pdf),
                filename: generatePdfFilename(content),
            };
        } catch (e) {
            const msg = `Error while generating PDF for content version ${versionKey} - ${e}`;
            console.error(msg);
            return {
                data: Buffer.from(msg),
                filename: generateErrorFilename(content),
            };
        }
    }
}
