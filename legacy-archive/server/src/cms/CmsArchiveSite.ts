import { CmsArchiveOpenSearchClient } from '../opensearch/CmsArchiveOpenSearchClient';
import express, { Express, Response, Router } from 'express';
import { CmsArchiveContentService } from './CmsArchiveContentService';
import { parseNumberParam, parseQueryParamsList } from '../utils/queryParams';
import mime from 'mime';
import { HtmlRenderer } from '../ssr/htmlRenderer';
import { transformQueryToContentSearchParams } from '../opensearch/queries/contentSearch';
import { CmsArchiveCategoriesService } from './CmsArchiveCategoriesService';
import { cspMiddleware } from '../routing/csp';
import { CmsArchiveBinariesService } from './CmsArchiveBinariesService';
import { PdfGenerator } from '../pdf/PdfGenerator';
import { Browser } from 'puppeteer';
import { DOWNLOAD_COOKIE_NAME } from '../../../shared/downloadCookie';
import { LegacyArchiveSiteConfig } from '@common/shared/siteConfigs';

type ContructorProps = {
    config: LegacyArchiveSiteConfig;
    browser: Browser;
    client: CmsArchiveOpenSearchClient;
    expressApp: Express;
    htmlRenderer: HtmlRenderer;
};

export class CmsArchiveSite {
    private readonly config: LegacyArchiveSiteConfig;
    private readonly pdfGenerator: PdfGenerator;

    private readonly categoriesService: CmsArchiveCategoriesService;
    private readonly contentService: CmsArchiveContentService;
    private readonly binariesService: CmsArchiveBinariesService;

    constructor({ config, browser, expressApp, client, htmlRenderer }: ContructorProps) {
        this.config = config;

        this.categoriesService = new CmsArchiveCategoriesService({
            config: config,
            client: client,
        });

        this.contentService = new CmsArchiveContentService({
            config: config,
            client: client,
            categoriesService: this.categoriesService,
        });

        this.binariesService = new CmsArchiveBinariesService({ config, client });

        this.pdfGenerator = new PdfGenerator({ browser, contentService: this.contentService });

        const siteRouter = express.Router();
        const apiRouter = express.Router();

        expressApp.use(config.baseUrl, siteRouter);
        expressApp.use(`${config.baseUrl}/api`, apiRouter);

        this.setupApiRoutes(apiRouter);
        this.setupSiteRoutes(siteRouter, htmlRenderer);
        this.setupFileRoutes(siteRouter);
    }

    async init() {
        return Promise.all([this.categoriesService.init()]);
    }

    private setupApiRoutes(router: Router) {
        router.get('/root-categories', (req, res) => {
            const rootCategories = this.categoriesService.getRootCategories();
            return res.send(rootCategories);
        });

        router.get('/categories/:keys', (req, res) => {
            const keys = parseQueryParamsList(req.params.keys);
            if (!keys) {
                return res.status(400).send('Required parameter "keys" is not valid');
            }

            const category = this.categoriesService.getCategories(keys);
            return res.send(category);
        });

        router.get('/content/:contentKey', async (req, res, next) => {
            const { contentKey } = req.params;

            const content = await this.contentService.getContent(contentKey);
            if (!content) {
                return next();
            }

            return res.send(content);
        });

        router.get('/version/:versionKey', async (req, res, next) => {
            const { versionKey } = req.params;

            const contentVersion = await this.contentService.getContentVersion(versionKey);
            if (!contentVersion) {
                return next();
            }

            return res.send(contentVersion);
        });

        router.get('/search', async (req, res) => {
            const params = transformQueryToContentSearchParams(req);
            if (!params) {
                return res.status(400).send('Invalid parameters for search request');
            }

            const result = await this.contentService.contentSearch(params);

            return res.send(result);
        });
    }

    private setupSiteRoutes(router: Router, htmlRenderer: HtmlRenderer) {
        router.get('/:versionKey?', cspMiddleware, async (req, res) => {
            const rootCategories = this.categoriesService.getRootCategories();

            const appContext = {
                rootCategories,
                selectedVersionKey: req.params.versionKey,
                cmsName: this.config.name,
                basePath: this.config.baseUrl,
            };

            const html = await htmlRenderer(req.url, appContext);

            return res.send(html);
        });

        router.get('/html/:versionKey', cspMiddleware, async (req, res, next) => {
            const { versionKey } = req.params;

            const version = await this.contentService.getContentVersion(versionKey);
            if (!version) {
                return next();
            }

            if (!version.html) {
                return res
                    .status(406)
                    .send(`Content with version key ${versionKey} does not have html content`);
            }

            return res.send(version.html);
        });
    }

    private setupFileRoutes(router: Router) {
        router.get('/pdf/single/:versionKey', async (req, res, next) => {
            const result = await this.pdfGenerator.generatePdfFromVersion(
                req.params.versionKey,
                parseNumberParam(req.query.width)
            );

            if (!result) {
                res.cookie(DOWNLOAD_COOKIE_NAME, false);
                return next();
            }

            const { filename, data } = result;

            return res
                .setHeader('Content-Disposition', `attachment; filename="${filename}"`)
                .setHeader('Content-Type', 'application/pdf')
                .cookie(DOWNLOAD_COOKIE_NAME, true)
                .send(data);
        });

        router.get('/pdf/multi/:versionKeys', async (req, res) => {
            await this.pdfGenerator.pdfFromVersionsResponse(
                req.params.versionKeys.split(','),
                res,
                parseNumberParam(req.query.width)
            );
        });

        router.get('/binary/file/:binaryKey', async (req, res, next) => {
            const { binaryKey } = req.params;

            const binary = await this.binariesService.getBinary(binaryKey);
            if (!binary) {
                return next();
            }

            return this.cmsBinaryResponse(
                binary.filename,
                binary.data,
                `attachment; filename="${binary.filename}"`,
                res
            );
        });

        router.use('/_public', async (req, res, next) => {
            const file = await this.binariesService.getStaticAsset(req.path);
            if (!file) {
                return next();
            }

            return this.cmsBinaryResponse(file.filename, file.data, 'inline', res);
        });

        router.use('/*/_image/:contentKey.:extension', async (req, res, next) => {
            const content = await this.contentService.getContent(req.params.contentKey);
            if (!content) {
                return next();
            }

            // The last item in the binaries array of an image content is the source file
            const binaryKey = content.binaries?.slice(-1)?.[0].key;
            if (!binaryKey) {
                return next();
            }

            const binary = await this.binariesService.getBinary(binaryKey);
            if (!binary) {
                return next();
            }

            return this.cmsBinaryResponse(binary.filename, binary.data, 'inline', res);
        });

        router.use('/*/_image/:contentKey/label/:label.:extension', async (req, res, next) => {
            const content = await this.contentService.getContent(req.params.contentKey);
            if (!content) {
                return next();
            }

            const binaryKey = content.binaries?.find((binary) =>
                binary.filename.endsWith(`${req.params.label}.${req.params.extension}`)
            )?.key;
            if (!binaryKey) {
                return next();
            }

            const binary = await this.binariesService.getBinary(binaryKey);
            if (!binary) {
                return next();
            }

            return this.cmsBinaryResponse(binary.filename, binary.data, 'inline', res);
        });
    }

    private cmsBinaryResponse(
        filename: string,
        base64Data: string,
        contentDisposition: string,
        res: Response
    ) {
        return res
            .setHeader('Content-Disposition', contentDisposition)
            .setHeader('Content-Type', mime.lookup(filename, 'application/octet-stream'))
            .send(Buffer.from(base64Data, 'base64'));
    }
}
