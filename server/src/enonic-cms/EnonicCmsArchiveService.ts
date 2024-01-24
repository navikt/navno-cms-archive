import { CmsArchiveDbClient } from '../opensearch/CmsArchiveDbClient';

type ConstructorProps = {
    client: CmsArchiveDbClient
}

export class EnonicCmsArchiveService {
    private readonly client: CmsArchiveDbClient;

    constructor({ client }: ConstructorProps) {
        this.client = client;
    }
}