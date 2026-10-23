import { RequestHandler } from 'express';
import { fetchJson } from '@common/shared/fetchUtils';
import { validateQuery } from 'utils/params';
import { xpServiceUrl } from 'utils/urls';
import { readFromIndex } from 'utils/readFromIndex';
import { SearchResponse } from '../../../shared/types';
import { Locale } from '../../../client/contentTree/NavigationBar';
import {
    XpArchiveOpenSearchClient,
    XP_ARCHIVE_INDEX,
} from '../opensearch/XpArchiveOpenSearchClient';

export class SearchService {
    private readonly SEARCH_API = xpServiceUrl('externalArchive/search');
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

    private async search(query: string, searchType?: string): Promise<SearchResponse | null> {
        return readFromIndex()
            ? this.searchIndex(query, searchType)
            : this.searchXp(query, searchType);
    }

    private async searchXp(query: string, searchType?: string): Promise<SearchResponse | null> {
        return fetchJson<SearchResponse>(this.SEARCH_API, {
            headers: { secret: process.env.SERVICE_SECRET },
            params: { query, searchType },
        });
    }

    //TODO: test søket mer når mer er indeksert. Test treff på mer enn 50
    private async searchIndex(query: string, searchType?: string): Promise<SearchResponse> {
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
