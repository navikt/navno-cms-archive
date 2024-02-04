import { CmsContent } from './cms-documents/content';

export type ContentSearchHit = Pick<
    CmsContent,
    'contentKey' | 'versionKey' | 'displayName' | 'path'
> & { score: number };

export type ContentSearchStatus = 'loading' | 'error' | 'success';

export type ContentSearchResult = {
    total: number;
    params: ContentSearchParams;
    status: ContentSearchStatus;
    hits: ContentSearchHit[];
};

export type ContentSearchSort = 'score' | 'datetime' | 'name';

export type ContentSearchParams = {
    from: number;
    size: number;
    fullQuery?: boolean;
    categoryKeys?: string[];
    query?: string;
    sort?: ContentSearchSort;
};
