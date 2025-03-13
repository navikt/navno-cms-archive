import React from 'react';
import { VersionReference } from 'shared/types';

// Content-specific cache for the version selector component
const contentCache: Record<
    string,
    {
        component: React.ReactNode | null;
        versions: VersionReference[];
        isOpen: boolean;
    }
> = {};

export const setCachedVersionSelector = (
    contentId: string,
    component: React.ReactNode,
    versions: VersionReference[],
    isOpen: boolean
) => {
    contentCache[contentId] = {
        component,
        versions,
        isOpen,
    };
};

export const getCachedVersionSelector = (contentId: string) => {
    return (
        contentCache[contentId] || {
            component: null,
            versions: [],
            isOpen: false,
        }
    );
};

export const clearCachedVersionSelector = (contentId: string) => {
    if (contentId in contentCache) {
        delete contentCache[contentId];
    }
};
