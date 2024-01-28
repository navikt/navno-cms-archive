import { CmsCategoryDocument } from '../../../common/cms-documents/category';
import { CmsContentDocument } from '../../../common/cms-documents/content';
import { CmsArchiveDbClient } from '../opensearch/CmsArchiveDbClient';
import { CmsBinaryDocument } from '../../../common/cms-documents/binary';
import { CmsArchiveSiteConfig } from './CmsArchiveSite';
import { sortCategories, sortVersions } from '../utils/sort';
import { AssetDocument } from '../opensearch/types';

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

    public getRootCategories(): Promise<CmsCategoryDocument[] | null> {
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
            .then(sortCategories);
    }

    public async getCategories(
        categoryKeys: string[]
    ): Promise<CmsCategoryDocument[] | null> {
        return this.client
            .getDocuments<CmsCategoryDocument>({
                index: this.categoriesIndex,
                _source_excludes: ['xmlAsString'],
                body: {
                    ids: categoryKeys,
                },
            })
            .then(sortCategories);
    }

    public async getContent(
        contentKey: string
    ): Promise<CmsContentDocument | null> {
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

        if (!result || result.length === 0) {
            return null;
        }

        if (result.length > 1) {
            console.error(
                `Multiple contents found with contentKey ${contentKey}`
            );
            return null;
        }

        return this.fixContent(result[0]);
    }

    public async getContentVersion(
        versionKey: string
    ): Promise<CmsContentDocument | null> {
        const result = await this.client.getDocument<CmsContentDocument>({
            index: this.contentsIndex,
            id: versionKey,
        });

        return this.fixContent(result);
    }

    public async getBinary(
        binaryKey: string
    ): Promise<CmsBinaryDocument | null> {
        return this.client.getDocument<CmsBinaryDocument>({
            index: this.binariesIndex,
            id: binaryKey,
        });
    }

    public async getStaticAsset(
        filePath: string
    ): Promise<AssetDocument | null> {
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

        if (!result || result.length === 0) {
            return null;
        }

        if (result?.length > 1) {
            console.error(`Found multiple files with path ${filePath}!`);
        }

        return result[0];
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
                .replace(/src="\/(\d)+\//g, `src="${basePath}/`)
                .replace(/href="\/(\d)+\//g, `href="${basePath}/`);
        }

        return content;
    }
}