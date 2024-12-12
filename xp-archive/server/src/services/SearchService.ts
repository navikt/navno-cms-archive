import { fetchJson } from '@common/shared/fetchUtils';
import { RequestHandler } from 'express';
import { validateQuery } from 'utils/params';
import { xpServiceUrl } from 'utils/urls';
import { SearchResponse } from '../../../shared/types';

export class SearchService {
    private readonly SEARCH_API = xpServiceUrl('externalArchive/search');

    public getSearchHandler: RequestHandler = async (req, res) => {
        if (!validateQuery(req.query, ['title'], [])) {
            return res.status(400).send('Missing or invalid parameters');
        }

        const { title } = req.query;
        const searchResponse = await this.search(title);

        return res.status(200).json(searchResponse);
    };

    private async search(title: string): Promise<SearchResponse | null> {
        const searchResponse = await fetchJson<SearchResponse>(this.SEARCH_API, {
            headers: { secret: process.env.SERVICE_SECRET },
            params: { title },
        });

        return searchResponse;
    }
}