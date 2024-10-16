export type CmsCategoryRef = {
    key: string;
    name: string;
};

export type CmsUser = {
    userstore?: string;
    name?: string;
    displayName?: string;
    email?: string;
};

export type CmsCategoryPath = CmsCategoryRef[];
