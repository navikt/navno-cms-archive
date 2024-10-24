export type ContentTreeEntryData = {
    id: string;
    path: string;
    name: string;
    displayName: string;
    type: string;
    numChildren: number;
};

export type ContentTreeResponse = {
    current: ContentTreeEntryData;
    children: ContentTreeEntryData[];
};

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

export type ContentIconResponse = {

}