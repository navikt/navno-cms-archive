import { CmsCategoryRef } from './_common';

type CmsContentRefData = {
    key: string,
    name: string,
    displayName: string,
    timestamp?: string,
}

export type CmsCategoryDocument = {
    xmlAsstring: string,

    key: string,
    title: string,

    contentTypeKey?: string,
    superKey?: string,

    categories: CmsCategoryRef[],
    contents: CmsContentRefData[]
}
