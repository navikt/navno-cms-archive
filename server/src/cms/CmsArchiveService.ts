import { CmsCategoryListItem } from '../../../common/cms-documents/category';
import {
    CategoryContentsResponse,
    CmsContentDocument,
    CmsContentListItem,
} from '../../../common/cms-documents/content';
import { CmsArchiveDbClient } from '../opensearch/CmsArchiveDbClient';
import { CmsBinaryDocument } from '../../../common/cms-documents/binary';
import { CmsArchiveSiteConfig } from './CmsArchiveSite';
import { sortVersions } from '../utils/sort';
import { AssetDocument, CmsCategoryDocument } from '../opensearch/types';
import { transformToCategoriesList } from './utils/transformToCategoriesList';
import { QueryDslQueryContainer } from '@opensearch-project/opensearch/api/types';

type ConstructorProps = {
    client: CmsArchiveDbClient;
    siteConfig: CmsArchiveSiteConfig;
};

export class CmsArchiveService {
    private readonly client: CmsArchiveDbClient;
    private readonly siteConfig: CmsArchiveSiteConfig;

    private readonly categoriesIndex: string;
    private readonly contentsIndex: string;
    private readonly binariesIndex: string;
    private readonly staticAssetsIndex: string;

    constructor({ client, siteConfig }: ConstructorProps) {
        const { indexPrefix } = siteConfig;

        this.client = client;
        this.siteConfig = siteConfig;

        this.categoriesIndex = `${indexPrefix}_categories`;
        this.contentsIndex = `${indexPrefix}_content`;
        this.binariesIndex = `${indexPrefix}_binaries`;
        this.staticAssetsIndex = `${indexPrefix}_assets`;
    }

    public async getRootCategories(): Promise<CmsCategoryListItem[] | null> {
        return this.client
            .search<CmsCategoryDocument>({
                index: this.categoriesIndex,
                _source_excludes: ['xmlAsString'],
                size: 100,
                body: {
                    query: {
                        bool: {
                            must_not: {
                                exists: {
                                    field: 'superKey',
                                },
                            },
                        },
                    },
                },
            })
            .then((result) => (result ? transformToCategoriesList(result.hits) : result));
    }

    public async getCategories(categoryKeys: string[]): Promise<CmsCategoryListItem[] | null> {
        return this.client
            .getDocuments<CmsCategoryDocument>({
                index: this.categoriesIndex,
                _source_excludes: ['xmlAsString'],
                body: {
                    ids: categoryKeys,
                },
            })
            .then(transformToCategoriesList);
    }

    public async getContentsForCategory(
        categoryKey: string,
        from: number = 0,
        size: number = 50,
        query?: string
    ): Promise<CategoryContentsResponse | null> {
        const must: QueryDslQueryContainer[] = [
            {
                term: {
                    isCurrentVersion: true,
                },
            },
            {
                term: {
                    'category.key': categoryKey,
                },
            },
        ];

        if (query) {
            must.push({
                multi_match: {
                    query,
                    fields: ['displayName^10', 'xmlAsString'],
                    type: 'phrase_prefix',
                },
            });
        }

        return this.client.search<CmsContentListItem>({
            index: this.contentsIndex,
            from,
            size,
            _source_includes: ['contentKey', 'versionKey', 'displayName'],
            body: {
                sort: {
                    name: 'asc',
                },
                query: {
                    bool: {
                        must,
                    },
                },
                track_total_hits: true,
            },
        });
    }

    public async getContent(contentKey: string): Promise<CmsContentDocument | null> {
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

    public async getContentVersion(versionKey: string): Promise<CmsContentDocument | null> {
        const result = await this.client.getDocument<CmsContentDocument>({
            index: this.contentsIndex,
            id: versionKey,
        });

        return this.fixContent(result);
    }

    public async getBinary(binaryKey: string): Promise<CmsBinaryDocument | null> {
        return this.client.getDocument<CmsBinaryDocument>({
            index: this.binariesIndex,
            id: binaryKey,
        });
    }

    public async getStaticAsset(filePath: string): Promise<AssetDocument | null> {
        const withoutLeadingSlash = filePath.replace(/^\//, '');

        const result = await this.client.search<AssetDocument>({
            index: this.staticAssetsIndex,
            body: {
                query: {
                    term: {
                        path: withoutLeadingSlash,
                    },
                },
            },
        });

        if (!result || result.hits.length === 0) {
            return null;
        }

        if (result.hits.length > 1) {
            console.error(`Found multiple files with path ${filePath}!`);
        }

        return result.hits[0];
    }

    private fixContent(content: CmsContentDocument | null) {
        if (!content) {
            return null;
        }

        sortVersions(content);

        if (content.html) {
            const { basePath } = this.siteConfig;

            content.html = content.html
                .replace(/(\r\n|\r|\n)/, '')
                .replace(/="\/(\d)+\//g, `="${basePath}/`);
        }

        return content;
    }
}
