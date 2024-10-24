import { fetchJson } from '@common/shared/fetchUtils';
import { XPContentTreeServiceResponse } from '../../../shared/types';
import { xpServiceUrl } from '../utils/urls';

export class ContentTreeService {
    private readonly CONTENT_TREE_API = xpServiceUrl('externalArchive/contentTree');

    public getContentTree(path: string) {
        return this.fetchContentTree(path);
    }

    private async fetchContentTree(path: string) {
        const response = await fetchJson<XPContentTreeServiceResponse>(this.CONTENT_TREE_API, {
            headers: { secret: process.env.SERVICE_SECRET },
            params: { path },
        });

        return response;
    }
}
