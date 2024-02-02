import { CmsContent } from './cms-documents/content';

export type ContentSearchHit = Pick<
    CmsContent,
    'contentKey' | 'versionKey' | 'displayName' | 'path'
> & { score: number };

export type ContentSearchResult = {
    query: string;
    total: number;
    error?: string;
    status?: string;
    hits: ContentSearchHit[];
};
