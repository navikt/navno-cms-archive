import { Browser } from 'puppeteer';
import { ContentService } from './ContentService';
import {
    generateErrorFilename,
    generatePdfFilename,
    generatePdfFooter,
    pixelWidthToA4Scale,
} from 'utils/pdf-utils';
import { RequestHandler } from 'express';
import { validateQuery } from 'utils/params';
// TODO: Flytt archiver til rot-mappe
import archiver from 'archiver';
import { ContentServiceResponse } from '../../../shared/types';

const DEFAULT_WIDTH_PX = 1024;
const MIN_WIDTH_PX = 400;

type PdfResult = {
    data: Buffer;
    filename: string;
};

type PdfServiceProps = {
    browser: Browser;
    contentService: ContentService;
};

export class PdfService {
    private readonly browser: Browser;
    private readonly contentService: ContentService;

    constructor({ browser, contentService }: PdfServiceProps) {
        this.browser = browser;
        this.contentService = contentService;
    }

    public generatePdfHandler: RequestHandler = async (req, res) => {
        if (!validateQuery(req.query, ['versionIds', 'contentId', 'locale'])) {
            return res.status(400).send('Parameter versionIds is required');
        }
        const versionIds = req.query.versionIds.split(',');

        if (versionIds.length === 0) {
            return res.status(400).send('Version keys array must be non-empty');
        }

        const { locale, contentId } = req.query;

        // TODO: Hent alle versjoner
        const contents = await this.contentService.fetchContent(contentId, locale, versionIds[0]);
        // this.pdfFromVersionsResponse(versionIds, res)
        // this.
        if (!contents) {
            return res.status(404).send('No content versions found');
        }

        // TODO: Vurder å ta med timestamp på første + siste
        // const zipFilename = `${contents.json.displayName}_${contents.json.createdTime}.zip`;

        const { filename, data } = await this.generateContentPdf(contents, DEFAULT_WIDTH_PX);

        return res
            .setHeader('Content-Disposition', `attachment; filename="${filename}"`)
            .setHeader('Content-Type', 'application/pdf')
            .send(data);
    };

    // //multi
    // private async pdfFromVersionsResponse(
    //     versionIds: string[],
    //     res: Response,
    //     width: number = DEFAULT_WIDTH_PX
    // ) {

    //     const newestVersion = contentVersions[0];
    //     const oldestVersion = contentVersions[contentVersions.length - 1];

    //     const zipFilename = `${newestVersion.name}_${oldestVersion.meta.timestamp}-${newestVersion.meta.timestamp}.zip`;

    //     res.setHeader(
    //         'Content-Disposition',
    //         `attachment; filename="${encodeURIComponent(zipFilename)}"`
    //     )
    //         .setHeader('Content-Type', 'application/zip')
    //         .setHeader('Transfer-Encoding', 'chunked')
    //         .cookie(DOWNLOAD_COOKIE_NAME, true);

    //     const archive = archiver('zip');

    //     archive.on('data', (chunk) => {
    //         res.write(chunk);
    //     });

    //     archive.on('end', () => {
    //         res.end();
    //     });

    //     for (const content of contentVersions) {
    //         if (!content.html) {
    //             continue;
    //         }

    //         await this.generateContentPdf(content, width).then((result) => {
    //             if (!res.headersSent) {
    //                 // Set an estimate for content-length, which allows clients to track the download progress
    //                 // This header is not according to spec for chunked responses, but browsers seem to respect it
    //                 res.setHeader('Content-Length', result.data.length * contentVersions.length);
    //             }

    //             archive.append(result.data, { name: result.filename });
    //         });
    //     }

    //     archive.finalize();
    // }

    private async generateContentPdf(
        content: ContentServiceResponse,
        width: number
    ): Promise<PdfResult> {
        const { html, json } = content;
        if (!html) {
            return {
                data: Buffer.from(
                    `Could not generate PDF from content version ${json._versionKey} - HTML field was empty`
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

            return {
                data: Buffer.from(pdf),
                filename: generatePdfFilename(content),
            };
        } catch (e) {
            const msg = `Error while generating PDF for content version ${json._versionKey} - ${e}`;
            console.error(msg);
            return {
                data: Buffer.from(msg),
                filename: generateErrorFilename(content),
            };
        }
    }
}
