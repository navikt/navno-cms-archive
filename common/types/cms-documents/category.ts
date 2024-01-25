import { CmsCategoryRef } from './_common.ts';

type CmsContentRefData = {
    key: string,
    name: string,
    displayName: string,
    timestamp?: string,
}

export type CmsCategoryDocument = {
    key: string,
    title: string,

    categories: CmsCategoryRef[],
    contents: CmsContentRefData[]

    contentTypeKey?: string,
    superKey?: string,

    xmlAsstring?: string,
}