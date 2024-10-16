import { CmsContent } from './cms-documents/content';

export type ContentSearchHit = Pick<
    CmsContent,
    'contentKey' | 'versionKey' | 'displayName' | 'path'
> & { score: number };

export type ContentSearchStatus = 'loading' | 'error' | 'success' | 'empty';

export type ContentSearchResult = {
    total: number;
    params: ContentSearchParams;
    status: ContentSearchStatus;
    hits: ContentSearchHit[];
};

export type ContentSearchSort = 'score' | 'datetime' | 'name';

export type ContentSearchType = 'titles' | 'locations' | 'all';

export type ContentSearchParams = {
    from: number;
    size: number;
    query?: string;
    sort?: ContentSearchSort;
    type?: ContentSearchType;
    withChildCategories?: boolean;
    categoryKeys?: string[];
    isCustom?: boolean;
};
