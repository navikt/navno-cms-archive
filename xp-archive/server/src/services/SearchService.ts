import { fetchJson } from '@common/shared/fetchUtils';
import { RequestHandler } from 'express';
import { validateQuery } from 'utils/params';
import { xpServiceUrl } from 'utils/urls';
import { SearchResponse } from '../../../shared/types';

export class SearchService {
    private readonly SEARCH_API = xpServiceUrl('externalArchive/search');

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
        const searchResponse = await fetchJson<SearchResponse>(this.SEARCH_API, {
            headers: { secret: process.env.SERVICE_SECRET },
            params: { query, searchType },
        });

        return searchResponse;
    }
}
