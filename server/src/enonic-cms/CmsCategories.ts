import { CmsCategoryDocument } from './document-types/category';
import { CmsArchiveDbClient } from '../opensearch/CmsArchiveDbClient';

type ConstructorProps = {
    index: string;
    openSearchClient: CmsArchiveDbClient;
}

export class CmsCategories {
    private readonly index: string;
    private readonly client: CmsArchiveDbClient;

    private rootCategories: CmsCategoryDocument[] = [];

    constructor({ index, openSearchClient }: ConstructorProps) {
        this.index = index;
        this.client = openSearchClient;
    }

    public async init() {
        await this.populateCategories();
    }

    private async populateCategories() {
        const rootCategoriesResult = await this.client.search({
            index: this.index,
            from: 0,
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
            // .then(res => res.statusCode === 200 ? res.body.hits.hits : null)
            // .catch((e) => {
            //     return null
            // });

        // console.log(rootCategoriesResult?.map((hit: any) => hit._source));
    }
}
