import { CmsContent, CmsContentDocument } from '../../../common/cms-documents/content';
import { CmsArchiveOpenSearchClient } from '../opensearch/CmsArchiveOpenSearchClient';
import { CmsArchiveSiteConfig } from './CmsArchiveSite';
import { sortVersions } from '../utils/sort';
import { ContentSearchParams, ContentSearchResult } from '../../../common/contentSearch';
import { buildContentSearchParams } from '../opensearch/queries/contentSearch';
import { CmsArchiveCategoriesService } from './CmsArchiveCategoriesService';

type ConstructorProps = {
    client: CmsArchiveOpenSearchClient;
    config: CmsArchiveSiteConfig;
    categoriesService: CmsArchiveCategoriesService;
};

export class CmsArchiveContentService {
    private readonly client: CmsArchiveOpenSearchClient;
    private readonly config: CmsArchiveSiteConfig;
    private readonly categoriesService: CmsArchiveCategoriesService;

    private readonly contentsIndex: string;

    constructor({ client, config, categoriesService }: ConstructorProps) {
        const { indexPrefix } = config;

        this.client = client;
        this.config = config;
        this.categoriesService = categoriesService;

        this.contentsIndex = `${indexPrefix}_content`;
    }

    public async contentSearch(params: ContentSearchParams): Promise<ContentSearchResult> {
        const result = await this.client.search<CmsContentDocument>({
            ...buildContentSearchParams(params, this.categoriesService),
            index: this.contentsIndex,
        });

        if (!result) {
            return {
                params,
                total: 0,
                status: 'error',
                hits: [],
            };
        }

        const hits = result.hits.map((hit) => ({
            contentKey: hit.contentKey,
            versionKey: hit.versionKey,
            displayName: hit.displayName,
            score: hit._score || 0,
            path: this.categoriesService.resolveCategoryPath(hit.category.key),
        }));

        return {
            params,
            total: result.total,
            status: 'success',
            hits,
        };
    }

    public async getContent(contentKey: string): Promise<CmsContent | null> {
        const result = await this.client.search<CmsContentDocument>({
            index: this.contentsIndex,
            body: {
                query: {
                    bool: {
                        must: [
                            {
                                term: {
                                    contentKey: {
                                        value: contentKey,
                                    },
                                },
                            },
                            {
                                term: {
                                    isCurrentVersion: {
                                        value: true,
                                    },
                                },
                            },
                        ],
                    },
                },
            },
        });

        if (!result || result.hits.length === 0) {
            return null;
        }

        if (result.hits.length > 1) {
            console.error(`Multiple contents found with contentKey ${contentKey}`);
            return null;
        }

        return this.fixContent(result.hits[0]);
    }

    public async getContentVersion(versionKey: string): Promise<CmsContent | null> {
        const result = await this.client.getDocument<CmsContentDocument>({
            index: this.contentsIndex,
            id: versionKey,
        });

        return this.fixContent(result);
    }

    private fixContent(contentDocument: CmsContentDocument | null): CmsContent | null {
        if (!contentDocument) {
            return null;
        }

        return {
            ...contentDocument,
            versions: sortVersions(contentDocument),
            html: this.fixHtml(contentDocument.html),
            path: this.categoriesService.resolveCategoryPath(contentDocument.category.key),
        };
    }

    private fixHtml(html?: string) {
        if (!html) {
            return html;
        }

        return html
            .replace(/(\r\n|\r|\n)/, '')
            .replace(/="\/(\d)+\//g, `="${this.config.basePath}/`);
    }
}
