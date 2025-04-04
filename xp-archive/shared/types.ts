import { Locale } from 'client/contentTree/NavigationBar';

export type ContentType = `${string}:${string}`;

export type ContentTreeEntryData = {
    id: string;
    versionId: string;
    path: string;
    name: string;
    displayName: string;
    type: string;
    locale: string;
    numChildren: number;
    isLocalized: boolean;
    hasLocalizedDescendants: boolean;
    // If true, this is an empty dummy tree node purely used for navigation, without any content available
    isEmpty?: boolean;
};

export type XPContentTreeServiceResponse = {
    current: ContentTreeEntryData;
    children: ContentTreeEntryData[];
};

export type XPContentServiceResponse = {
    contentRaw: Content;
    contentRenderProps?: Content;
    versions: VersionReference[];
};

export type ContentServiceResponse = {
    json: Content;
    versions: VersionReference[];
    html?: string;
};

export type VersionReference = {
    versionId: string;
    nodeId: string;
    nodePath: string;
    timestamp: string;
    locale: string;
    displayName: string;
    type: ContentType;
};

export type Attachment = {
    name: string;
    mimeType: string;
    size: number;
};

// This is not a complete type. Expand as needed.
export type Content = {
    _id: string;
    _path: string;
    _versionKey: string;
    displayName: string;
    type: ContentType;
    language: string;
    locale: string;
    createdTime: string;
    modifiedTime: string;
    publish?: {
        first?: string;
        from?: string;
        to?: string;
    };
    data: Record<string, unknown>;
    x?: {
        'no-nav-navno'?: {
            redirectToLayer?: {
                locale?: string;
            };
        };
    };
    attachment?: Attachment;
    originalContentTypeName?: string;
};

export type SearchResponse = {
    total: number;
    query: string;
    hits: {
        _id: string;
        _path: string;
        layerLocale: Locale;
        language?: string;
        displayName: string;
        type: string;
    }[];
    hasMore: boolean;
};
