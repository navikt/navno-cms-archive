import { CmsArchiveDbClient } from '../opensearch/CmsArchiveDbClient';
import express, { Express, Router } from 'express';
import { CmsArchiveService } from './CmsArchiveService';
import { parseQueryParamsList } from '../utils/queryParams';
import mime from 'mime';
import { HtmlRenderer } from '../site/ssr/htmlRenderer';

type CmsArchiveSiteConfig = {
    name: string;
    basePath: string;
    indexPrefix: string;
};

type Props = {
    config: CmsArchiveSiteConfig;
    expressApp: Express;
    dbClient: CmsArchiveDbClient;
    htmlRenderer: HtmlRenderer;
};

export class CmsArchiveSite {
    private readonly config: CmsArchiveSiteConfig;
    private readonly cmsArchiveService: CmsArchiveService;

    constructor({ config, expressApp, dbClient, htmlRenderer }: Props) {
        this.config = config;
        this.cmsArchiveService = new CmsArchiveService({
            client: dbClient,
            indexPrefix: config.indexPrefix,
        });

        const siteRouter = express.Router();
        const apiRouter = express.Router();

        expressApp.use(config.basePath, siteRouter);
        expressApp.use(`${config.basePath}/api`, apiRouter);

        this.setupApiRoutes(apiRouter);
        this.setupSiteRoutes(siteRouter, htmlRenderer);
    }

    private setupApiRoutes(router: Router) {
        router.get('/root-categories', async (req, res) => {
            const rootCategories =
                await this.cmsArchiveService.getRootCategories();
            return res.send(rootCategories);
        });

        router.get('/categories/:keys', async (req, res) => {
            const keys = parseQueryParamsList(req.params.keys);
            if (!keys) {
                return res
                    .status(400)
                    .send('Required parameter "keys" is not valid');
            }

            const category = await this.cmsArchiveService.getCategories(keys);
            return res.send(category);
        });

        router.get('/content/:contentKey', async (req, res) => {
            const { contentKey } = req.params;

            const content = await this.cmsArchiveService.getContent(contentKey);
            if (!content) {
                return res
                    .status(404)
                    .send(`Content with key ${contentKey} not found`);
            }

            return res.send(content);
        });

        router.get('/version/:versionKey', async (req, res) => {
            const { versionKey } = req.params;

            const contentVersion =
                await this.cmsArchiveService.getContentVersion(versionKey);
            if (!contentVersion) {
                return res
                    .status(404)
                    .send(`Content version with key ${versionKey} not found`);
            }

            return res.send(contentVersion);
        });

        router.get('/binary/document/:binaryKey', async (req, res) => {
            const { binaryKey } = req.params;

            const binary = await this.cmsArchiveService.getBinary(binaryKey);
            if (!binary) {
                return res
                    .status(404)
                    .send(`Binary with key ${binaryKey} not found`);
            }

            return res.send(binary);
        });

        router.get('/binary/file/:binaryKey', async (req, res) => {
            const { binaryKey } = req.params;

            const binary = await this.cmsArchiveService.getBinary(binaryKey);
            if (!binary) {
                return res
                    .status(404)
                    .send(`Binary with key ${binaryKey} not found`);
            }

            const contentType =
                mime.lookup(binary.filename) || 'application/octet-stream';

            return res
                .setHeader(
                    'Content-Dispositon',
                    `attachment; filename="${binary.filename}"`
                )
                .setHeader('Content-Type', contentType)
                .send(Buffer.from(binary.data, 'base64'));
        });
    }

    private async setupSiteRoutes(router: Router, htmlRenderer: HtmlRenderer) {
        router.get('/', async (req, res) => {
            const rootCategories =
                (await this.cmsArchiveService.getRootCategories()) || [];

            const html = await htmlRenderer(req.url, {
                rootCategories,
                cmsName: this.config.name,
                basePath: this.config.basePath,
            });

            return res.send(html);
        });
    }
}
