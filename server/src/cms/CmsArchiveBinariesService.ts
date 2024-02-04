import { CmsArchiveSiteConfig } from './CmsArchiveSite';
import { CmsArchiveOpenSearchClient } from '../opensearch/CmsArchiveOpenSearchClient';

type ConstructorProps = {
    config: CmsArchiveSiteConfig;
    client: CmsArchiveOpenSearchClient;
};

export class CmsArchiveBinariesService {
    private readonly config: CmsArchiveSiteConfig;
    private readonly client: CmsArchiveOpenSearchClient;

    constructor({ config, client }: ConstructorProps) {
        this.config = config;
        this.client = client;
    }
}
