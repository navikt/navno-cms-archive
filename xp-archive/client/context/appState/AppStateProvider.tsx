import React, { useCallback, useMemo, useState } from 'react';
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
