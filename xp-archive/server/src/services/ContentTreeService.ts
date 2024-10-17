import { fetchJson } from '@common/shared/fetchJson';

type ContentTreeEntry = {
    id: string;
    path: string;
    name: string;
    displayName: string;
};

type ContentTreeResponse = {
    current: ContentTreeEntry;
    children: ContentTreeEntry[];
};

export class ContentTreeService {
    private readonly CONTENT_TREE_API = `http://localhost:8080/_/service/no.nav.navno/contentTree`;

    constructor() {}

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
