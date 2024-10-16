import { CmsCategoryRef } from '../../../shared/cms-documents/_common';

export type AssetDocument = {
    path: string;
    dirname: string;
    filename: string;
    filesize: number;
    modifiedTime: string;
    data: string;
};

type CmsContentRefData = {
    key: string;
    name: string;
    displayName: string;
    timestamp: string;
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
