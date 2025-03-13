import React from 'react';
import { VersionReference } from 'shared/types';

// Global cache for the version selector component
let cachedVersionSelector: React.ReactNode | null = null;
let cachedVersions: VersionReference[] = [];
let cachedIsOpen = false;

export const setCachedVersionSelector = (
    component: React.ReactNode,
    versions: VersionReference[],
    isOpen: boolean
) => {
    cachedVersionSelector = component;
    cachedVersions = versions;
    cachedIsOpen = isOpen;
};

export const getCachedVersionSelector = () => ({
    component: cachedVersionSelector,
    versions: cachedVersions,
    isOpen: cachedIsOpen,
});
