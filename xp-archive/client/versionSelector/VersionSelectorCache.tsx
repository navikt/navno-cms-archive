import React from 'react';
import { VersionReference } from 'shared/types';

type VersionSelectorCacheItem = {
    component: React.ReactNode | null;
    versions: VersionReference[];
    isOpen: boolean;
};

const DEFAULT_CACHE: VersionSelectorCacheItem = {
    component: null,
    versions: [],
    isOpen: false,
};

const contentCache: Record<string, VersionSelectorCacheItem> = {};

export const setCachedVersionSelector = (
    contentId: string,
    component: React.ReactNode,
    versions: VersionReference[],
    isOpen: boolean
) => {
    Object.keys(contentCache).forEach((key) => {
        if (key !== contentId) {
            delete contentCache[key];
        }
    });

    contentCache[contentId] = {
        component,
        versions,
        isOpen,
    };
};

export const getCachedVersionSelector = (contentId: string): VersionSelectorCacheItem => {
    return contentCache[contentId] || DEFAULT_CACHE;
};

export const clearCachedVersionSelector = (contentId: string): void => {
    if (contentId in contentCache) {
        delete contentCache[contentId];
    }
};
