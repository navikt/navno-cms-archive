import { Browser } from 'puppeteer';
import { ContentService } from './ContentService';
import {
    generateErrorFilename,
    generatePdfFilename,
    generatePdfInfo,
    pixelWidthToA4Scale,
} from 'utils/pdf-utils';
import { RequestHandler, Response } from 'express';
import { validateQuery } from 'utils/params';
import archiver from 'archiver';
import { ContentServiceResponse } from '../../../shared/types';
import { getErrorMessage } from '@common/shared/fetchUtils';

const DEFAULT_WIDTH_PX = 1024;
const MIN_WIDTH_PX = 400;

type PdfResult = {
    data: Buffer;
    timestamp: string;
    filename: string;
    displayName: string;
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
        if (!validateQuery(req.query, ['versionIds', 'locale'])) {
            res.status(400).send('Parameters versionIds and locale are required');
            return;
        }

        const versionIds = req.query.versionIds.split(',').map((v) => v.split(':'));
        const { locale } = req.query;

        if (versionIds.length === 0) {
            res.status(400).send('Version keys array must be non-empty');
            return;
        }
        const contents = await Promise.all(
            versionIds.map(([nodeId, versionId]) =>
                this.contentService
                    .fetchContent(nodeId, locale, versionId)
                    .then((val) => (val ? this.generateContentPdf(val, DEFAULT_WIDTH_PX) : null))
            )
        );
        const allPdfs = contents.filter((c) => c !== null);
        if (allPdfs.length === 0) {
            res.status(404).send('No content versions found');
            return;
        }

        if (allPdfs.length === 1) {
            this.singlePdf(allPdfs[0], res);
            return;
        }

        this.createPdfZip(allPdfs, res);
    };

    private singlePdf(content: PdfResult, res: Response) {
        const { filename, data } = content;

        return res
            .setHeader('Content-Disposition', `attachment; filename="${filename}"`)
            .setHeader('Content-Type', 'application/pdf')
            .send(data);
    }

    private createPdfZip(pdfs: PdfResult[], res: Response) {
        const newestVersion = pdfs[0];
        // const oldestVersion = pdfs[pdfs.length - 1];

        const zipFilename = `${newestVersion.displayName.slice(0, 50)}.zip`;

        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${encodeURIComponent(zipFilename)}"`
        )
            .setHeader('Content-Type', 'application/zip')
            .setHeader('Transfer-Encoding', 'chunked');

        const archive = archiver('zip');

        archive.on('data', (chunk) => {
            res.write(chunk);
        });

        archive.on('end', () => {
            res.end();
        });

        for (const pdf of pdfs) {
            archive.append(pdf.data, { name: pdf.filename });
        }

        archive.finalize().catch(() => {});
    }

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
                timestamp: json.createdTime,
                filename: generateErrorFilename(content),
                displayName: json.displayName,
            };
        }

        const widthActual = width >= MIN_WIDTH_PX ? width : DEFAULT_WIDTH_PX;

        try {
            const page = await this.browser.newPage();

            // Log Page events for debugging should generation fail
            page.on('request', (request) => {
                console.log(`Puppeteer: Request: ${request.method()} ${request.url()}`);
                request.continue().catch(() => {});
            });

            page.on('requestfailed', (request) => {
                console.error(
                    `Puppeteer: Request failed: ${request.url()} - ${request.failure()?.errorText}`
                );
            });

            page.on('response', (response) => {
                console.log(`Puppeteer: Response: ${response.status()} ${response.url()}`);
            });

            page.on('console', (msg) => {
                console.log(`Puppeteer: Browser console: ${msg.type()} - ${msg.text()}`);
            });

            page.on('pageerror', (error) => {
                console.error(`Puppeteer: Page error:`, error);
            });

            // Remove decorator-code in print
            const htmlWithoutDecorator = html.replaceAll(
                /(<decorator-header([^;]*)<\/decorator-header>|<decorator-footer([^;]*)<\/decorator-footer>|<decorator-footer([^;]*)<\/decorator-footer>)/g,
                ''
            );

            await page.setViewport({ width: widthActual, height: 1024, deviceScaleFactor: 1 });
            await page.emulateMediaType('screen');
            await page.setContent(htmlWithoutDecorator);

            const pdf = await page.pdf({
                printBackground: true,
                format: 'A4',
                scale: pixelWidthToA4Scale(widthActual),
                displayHeaderFooter: true,
                headerTemplate: generatePdfInfo(content),
                margin: {
                    top: '24px',
                    right: '4px',
                    bottom: '4px',
                    left: '4px',
                },
            });

            await page.close();

            return {
                data: Buffer.from(pdf),
                timestamp: json.createdTime,
                filename: generatePdfFilename(content),
                displayName: json.displayName,
            };
        } catch (e) {
            const msg = `Error while generating PDF for content version ${json._versionKey} - ${getErrorMessage(e)}`;
            console.error(msg);
            return {
                data: Buffer.from(msg),
                timestamp: json.createdTime,
                filename: generateErrorFilename(content),
                displayName: json.displayName,
            };
        }
    }
}
