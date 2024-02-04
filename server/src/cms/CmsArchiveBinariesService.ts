import { CmsArchiveSiteConfig } from './CmsArchiveSite';
import { CmsArchiveOpenSearchClient } from '../opensearch/CmsArchiveOpenSearchClient';
import { CmsBinaryDocument } from '../../../common/cms-documents/binary';
import { AssetDocument } from '../opensearch/types';

type ConstructorProps = {
    config: CmsArchiveSiteConfig;
    client: CmsArchiveOpenSearchClient;
};

export class CmsArchiveBinariesService {
    private readonly client: CmsArchiveOpenSearchClient;

    private readonly binariesIndex: string;
    private readonly assetsIndex: string;

    constructor({ config, client }: ConstructorProps) {
        const { indexPrefix } = config;

        this.client = client;

        this.binariesIndex = `${indexPrefix}_binaries`;
        this.assetsIndex = `${indexPrefix}_assets`;
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
            index: this.assetsIndex,
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
}
