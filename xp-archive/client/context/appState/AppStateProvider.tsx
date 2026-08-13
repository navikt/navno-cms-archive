import React, { useState } from 'react';
import { AppStateContext } from './AppStateContext';
import { xpArchiveConfig } from '../../../../common/src/shared/siteConfigs';

type Props = {
    children: React.ReactNode;
};

export type SelectedContent = {
    contentId: string;
    locale: string;
    versionId: string | undefined;
};

const getSelectedContentFromPath = (): SelectedContent | undefined => {
    if (typeof window === 'undefined') {
        return undefined;
    }

    const matches = /\/xp\/([^/]+)\/([^/]+)\/([^/]+)?/.exec(window.location.pathname);

    if (!matches) {
        return undefined;
    }

    const [, contentId, locale, versionId] = matches;
    return {
        contentId,
        locale,
        versionId: versionId || undefined,
    };
};

export const AppStateProvider = ({ children }: Props) => {
    const [selectedContent, setSelectedContent] = useState<SelectedContent>();
    const [versionViewOpen, setVersionViewOpen] = useState(false);
    const activeSelectedContent = selectedContent ?? getSelectedContentFromPath();

    const updateSelectedContent = (newSelectedContent: SelectedContent) => {
        setSelectedContent(newSelectedContent);
        const newUrl = `${xpArchiveConfig.basePath}/${newSelectedContent.contentId}/${newSelectedContent.locale}/${newSelectedContent.versionId || ''}`;
        window.history.pushState({}, '', newUrl);
    };

    return (
        <AppStateContext.Provider
            value={{
                selectedContentId: activeSelectedContent?.contentId,
                selectedVersion: activeSelectedContent?.versionId,
                selectedLocale: activeSelectedContent?.locale,
                updateSelectedContent,
                versionViewOpen,
                setVersionViewOpen,
            }}
        >
            {children}
        </AppStateContext.Provider>
    );
};
