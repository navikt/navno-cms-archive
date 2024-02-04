import { CmsArchiveOpenSearchClient } from '../opensearch/CmsArchiveOpenSearchClient';
import express, { Express, Response, Router } from 'express';
import { CmsArchiveContentService } from './CmsArchiveContentService';
import { parseQueryParamsList } from '../utils/queryParams';
import mime from 'mime';
import { HtmlRenderer } from '../site/ssr/htmlRenderer';
import { transformQueryToContentSearchParams } from '../opensearch/queries/contentSearch';
import { CmsArchiveCategoriesService } from './CmsArchiveCategoriesService';
import { cspMiddleware } from '../routing/csp';

export type CmsArchiveSiteConfig = {
    name: string;
    basePath: string;
    indexPrefix: string;
};

type ContructorProps = {
    config: CmsArchiveSiteConfig;
    expressApp: Express;
    dbClient: CmsArchiveOpenSearchClient;
    htmlRenderer: HtmlRenderer;
};

export class CmsArchiveSite {
    private readonly config: CmsArchiveSiteConfig;
    private readonly cmsArchiveContentService: CmsArchiveContentService;
    private readonly cmsArchiveCategoriesService: CmsArchiveCategoriesService;

    constructor({ config, expressApp, dbClient, htmlRenderer }: ContructorProps) {
        this.config = config;

        this.cmsArchiveCategoriesService = new CmsArchiveCategoriesService({
            config: config,
            client: dbClient,
        });

        this.cmsArchiveContentService = new CmsArchiveContentService({
            client: dbClient,
            siteConfig: config,
            categoriesService: this.cmsArchiveCategoriesService,
        });

        const siteRouter = express.Router();
        const apiRouter = express.Router();

        expressApp.use(config.basePath, siteRouter);
        expressApp.use(`${config.basePath}/api`, apiRouter);

        this.setupApiRoutes(apiRouter);
        this.setupSiteRoutes(siteRouter, htmlRenderer);
        this.setupFileRoutes(siteRouter);
    }

    async init() {
        this.cmsArchiveCategoriesService.init();
    }

    private setupApiRoutes(router: Router) {
        router.get('/root-categories', (req, res) => {
            const rootCategories = this.cmsArchiveCategoriesService.getRootCategories();
            return res.send(rootCategories);
        });

        router.get('/categories/:keys', async (req, res) => {
            const keys = parseQueryParamsList(req.params.keys);
            if (!keys) {
                return res.status(400).send('Required parameter "keys" is not valid');
            }

            const category = await this.cmsArchiveCategoriesService.getCategories(keys);
            return res.send(category);
        });

        router.get('/content/:contentKey', async (req, res) => {
            const { contentKey } = req.params;

            const content = await this.cmsArchiveContentService.getContent(contentKey);
            if (!content) {
                return res.status(404).send(`Content with key ${contentKey} not found`);
            }

            return res.send(content);
        });

        router.get('/version/:versionKey', async (req, res) => {
            const { versionKey } = req.params;

            const contentVersion =
                await this.cmsArchiveContentService.getContentVersion(versionKey);
            if (!contentVersion) {
                return res.status(404).send(`Content version with key ${versionKey} not found`);
            }

            return res.send(contentVersion);
        });

        router.get('/search', async (req, res) => {
            const params = transformQueryToContentSearchParams(req);
            if (!params) {
                return res.status(400).send('Invalid parameters for search request');
            }

            const result = await this.cmsArchiveContentService.contentSearch(params);

            return res.send(result);
        });
    }

    private setupSiteRoutes(router: Router, htmlRenderer: HtmlRenderer) {
        router.get('/:versionKey?', cspMiddleware, async (req, res) => {
            const rootCategories = this.cmsArchiveCategoriesService.getRootCategories();

            const appContext = {
                rootCategories,
                selectedVersionKey: req.params.versionKey,
                cmsName: this.config.name,
                basePath: this.config.basePath,
            };

            const html = await htmlRenderer(req.url, appContext);

            return res.send(html);
        });

        router.get('/html/:versionKey', cspMiddleware, async (req, res) => {
            const { versionKey } = req.params;

            const version = await this.cmsArchiveContentService.getContentVersion(versionKey);
            if (!version) {
                return res.status(404).send(`Content with version key ${versionKey} not found`);
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
        router.get('/binary/file/:binaryKey', async (req, res) => {
            const { binaryKey } = req.params;

            const binary = await this.cmsArchiveContentService.getBinary(binaryKey);
            if (!binary) {
                return res.status(404).send(`Binary with key ${binaryKey} not found`);
            }

            return this.fileResponse(
                binary.filename,
                binary.data,
                `attachment; filename="${binary.filename}"`,
                res
            );
        });

        router.use('/_public', async (req, res, next) => {
            const file = await this.cmsArchiveContentService.getStaticAsset(req.path);
            if (!file) {
                return next();
            }

            return this.fileResponse(file.filename, file.data, 'inline', res);
        });

        router.use('/*/_image/:contentKey.:extension', async (req, res, next) => {
            const content = await this.cmsArchiveContentService.getContent(req.params.contentKey);
            if (!content) {
                return next();
            }

            const binaryKey = content.binaries?.slice(-1)?.[0].key;
            if (!binaryKey) {
                return next();
            }

            const binary = await this.cmsArchiveContentService.getBinary(binaryKey);
            if (!binary) {
                return next();
            }

            return this.fileResponse(binary.filename, binary.data, 'inline', res);
        });

        router.use('/*/_image/:contentKey/label/:label.:extension', async (req, res, next) => {
            const content = await this.cmsArchiveContentService.getContent(req.params.contentKey);
            if (!content) {
                return next();
            }

            const binaryKey = content.binaries?.find((binary) =>
                binary.filename.endsWith(`${req.params.label}.${req.params.extension}`)
            )?.key;
            if (!binaryKey) {
                return next();
            }

            const binary = await this.cmsArchiveContentService.getBinary(binaryKey);
            if (!binary) {
                return next();
            }

            return this.fileResponse(binary.filename, binary.data, 'inline', res);
        });
    }

    private fileResponse(
        filename: string,
        data: string,
        contentDisposition: string,
        res: Response
    ) {
        const contentType = mime.lookup(filename) || 'application/octet-stream';

        return res
            .setHeader('Content-Dispositon', contentDisposition)
            .setHeader('Content-Type', contentType)
            .send(Buffer.from(data, 'base64'));
    }
}
