import { RequestHandler } from 'express';
import { validateQuery } from 'utils/params';
import { SearchResponse } from '../../../shared/types';
import { Locale } from '../../../client/contentTree/NavigationBar';
import {
    XpArchiveOpenSearchClient,
    XP_ARCHIVE_INDEX,
} from '../opensearch/XpArchiveOpenSearchClient';

export class SearchService {
    private readonly openSearchClient: XpArchiveOpenSearchClient;

    constructor(openSearchClient: XpArchiveOpenSearchClient) {
        this.openSearchClient = openSearchClient;
    }

    public getSearchHandler: RequestHandler = async (req, res) => {
        if (!validateQuery(req.query, ['query'], ['searchType'])) {
            res.status(400).send('Missing or invalid parameters');
            return;
        }

        const { query, searchType } = req.query;
        const searchResponse = await this.search(query, searchType);

        res.status(200).json(searchResponse);
    };

    //TODO: test søket mer når mer er indeksert. Test treff på mer enn 50
    private async search(query: string, searchType?: string): Promise<SearchResponse> {
        const { total, hits } = await this.openSearchClient.searchDocuments(
            XP_ARCHIVE_INDEX,
            query,
            searchType
        );

        return {
            total,
            query,
            hasMore: total > 50,
            hits: hits.map((hit) => ({
                _id: hit.nodeId,
                _path: hit.path,
                layerLocale: hit.locale as Locale,
                displayName: hit.displayName,
                type: hit.type,
            })),
        };
    }
}
