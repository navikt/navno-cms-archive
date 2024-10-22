import { fetchJson } from '@common/shared/fetchJson';
import { ContentTreeResponse } from '../../../shared/types';
import { xpServiceUrl } from '../utils/urls';

export class ContentTreeService {
    private readonly CONTENT_TREE_API = xpServiceUrl('contentTree');

    public getContentTree(path: string) {
        return this.fetchContentTree(path);
    }

    private async fetchContentTree(path: string) {
        const response = await fetchJson<ContentTreeResponse>(this.CONTENT_TREE_API, {
            headers: { secret: 'dummyToken' },
            params: { path },
        });

        return response;
    }
}
