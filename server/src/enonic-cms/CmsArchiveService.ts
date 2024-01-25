import { CmsCategoryDocument } from '../../../common/types/cms-documents/category';
import { CmsContentDocument } from '../../../common/types/cms-documents/content';
import { CmsArchiveDbClient } from '../opensearch/CmsArchiveDbClient';
import { CmsBinaryDocument } from '../../../common/types/cms-documents/binary';

type ConstructorProps = {
    client: CmsArchiveDbClient;
    indexPrefix: string;
};

export class CmsArchiveService {
    private readonly client: CmsArchiveDbClient;
    private readonly categoriesIndex: string;
    private readonly contentsIndex: string;
    private readonly binariesIndex: string;

    constructor({ client, indexPrefix }: ConstructorProps) {
        this.client = client;
        this.categoriesIndex = `${indexPrefix}_categories`;
        this.contentsIndex = `${indexPrefix}_content`;
        this.binariesIndex = `${indexPrefix}_binaries`;
    }

    public getRootCategories(): Promise<CmsCategoryDocument[] | null> {
        return this.client.search<CmsCategoryDocument>({
            index: this.categoriesIndex,
            _source_excludes: ['xmlAsString'],
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
        });
    }

    public async getCategories(
        categoryKeys: string[]
    ): Promise<CmsCategoryDocument[] | null> {
        return this.client.getDocuments<CmsCategoryDocument>({
            index: this.categoriesIndex,
            _source_excludes: ['xmlAsString'],
            body: {
                ids: categoryKeys,
            },
        });
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

        return result[0];
    }

    public async getContentVersion(
        versionKey: string
    ): Promise<CmsContentDocument | null> {
        return this.client.getDocument<CmsContentDocument>({
            index: this.contentsIndex,
            id: versionKey,
        });
    }

    public async getBinary(
        binaryKey: string
    ): Promise<CmsBinaryDocument | null> {
        return this.client.getDocument<CmsBinaryDocument>({
            index: this.binariesIndex,
            id: binaryKey,
        });
    }
}
