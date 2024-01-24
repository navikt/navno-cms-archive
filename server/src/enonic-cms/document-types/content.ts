import { CmsCategoryRef, CmsUser } from './_common';

type ContentVersionReference = {
    key: string,
    statusKey?: string,
    status?: string,
    timestamp?: string,
    title?: string,
    comment?: string,
    modifier?: CmsUser,
}

type ContentBinaryReference = {
    key: string,
    filename: string,
    filesize: number
}

type ContentLocation = {
    siteKey?: string,
    type?: string,
    menuItemKey?: string,
    menuItemName?: string,
    menuItemPath?: string,
    menuItemDisplayName?: string,
    home?: boolean,
}

type ContentMetaData = {
    unitKey?: string,
    state?: string,
    status?: string,
    published?: string,
    languageCode?: string,
    languageKey?: string,
    priority?: string,

    contentType?: string,
    contentTypeKey?: string,

    created?: string,
    timestamp?: string,
    publishFrom?: string,
    publishTo?: string,

    owner?: CmsUser,
    modifier?: CmsUser,
}

export type CmsContentDocument = {
    html?: string,
    xmlAsstring: string,

    contentKey: string,
    versionKey: string,
    isCurrentVersion: boolean,

    name: string,
    displayName: string,

    versions?: Array<ContentVersionReference>,
    locations?: Array<ContentLocation>,
    category?: CmsCategoryRef,
    binaries?: Array<ContentBinaryReference>,

    meta: ContentMetaData,
}