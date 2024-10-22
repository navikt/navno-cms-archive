import { fetchJson } from '@common/shared/fetchJson';
import { xpServiceUrl } from '../utils/urls';

export class ContentService {
    private readonly SITECONTENT_API_URL = xpServiceUrl('sitecontent');

    public getCurrentContent(id: string, locale = 'no') {
        const response = fetchJson(this.SITECONTENT_API_URL, {
            headers: { secret: process.env.SERVICE_SECRET },
            params: { id, locale, branch: 'draft' },
        });

        return response;
    }
}
