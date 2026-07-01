import { Content, ContentType } from '../../../shared/types';

export type XpArchiveDocument = {
    nodeId: string;
    versionId: string;
    path: string;
    displayName: string;
    type: ContentType;
    locale: string;
    timestamp: string;
    modifiedTime: string;
    searchText: string;
    html?: string;
    json: Content;
};
