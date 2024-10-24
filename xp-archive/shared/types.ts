export type ContentTreeEntryData = {
    id: string;
    path: string;
    name: string;
    displayName: string;
    type: string;
    numChildren: number;
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
};

// This is not a complete type. Expand as needed.
export type Content = {
    type: `${string}:${string}`;
    _id: string;
    _path: string;
    createdTime: string;
    modifiedTime: string;
    displayName: string;
    language: string;
    publish?: {
        first?: string;
        from?: string;
        to?: string;
    };
    layerLocale?: string;
    data: Record<string, unknown>;
};
