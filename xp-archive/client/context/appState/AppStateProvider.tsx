import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

export const AppStateProvider = ({ children }: Props) => {
    const [selectedContent, setSelectedContent] = useState<SelectedContent>();
    const [versionViewOpen, setVersionViewOpen] = useState(false);

    useEffect(() => {
        const path = window.location.pathname;
        const matches = /\/xp\/([^/]+)\/([^/]+)\/([^/]+)?/.exec(path);

        if (matches) {
            const [, contentId, locale, versionId] = matches;
            updateSelectedContent({ contentId, locale, versionId: versionId || undefined });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateSelectedContent = useCallback(
        (newSelectedContent: SelectedContent) => {
            setSelectedContent(newSelectedContent);
            const newUrl = `${xpArchiveConfig.basePath}/${newSelectedContent.contentId}/${newSelectedContent.locale}/${newSelectedContent.versionId || ''}`;
            window.history.pushState({}, '', newUrl);
        },
        [setSelectedContent]
    );

    const selectedVersionMemoized = useMemo(
        () => selectedContent?.versionId,
        [selectedContent?.versionId]
    );
    const setVersionViewOpenMemoized = useCallback(setVersionViewOpen, [setVersionViewOpen]);

    return (
        <AppStateContext.Provider
            value={{
                selectedContentId: selectedContent?.contentId,
                selectedVersion: selectedVersionMemoized,
                selectedLocale: selectedContent?.locale,
                updateSelectedContent,
                versionViewOpen,
                setVersionViewOpen: setVersionViewOpenMemoized,
            }}
        >
            {children}
        </AppStateContext.Provider>
    );
};
