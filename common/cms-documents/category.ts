import { CmsCategoryRef } from './_common';

type CmsContentRefData = {
    key: string;
    name: string;
    displayName: string;
    timestamp?: string;
};

export type CmsCategoryDocument = {
    key: string;
    title: string;

    categories: CmsCategoryRef[];
    contents: CmsContentRefData[];

    contentTypeKey?: string;
    superKey?: string;

    xmlAsString: string;
};

export type CmsCategoryListItem = Pick<CmsCategoryDocument, 'key' | 'title' | 'categories'> & {
    contentCount: number;
    path: CmsCategoryRef[];
};
