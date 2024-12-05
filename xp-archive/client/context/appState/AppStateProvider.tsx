import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { AppStateContext } from './AppStateContext';
import { Locale } from 'client/contentTree/NavigationBar';

type Props = {
    children: React.ReactNode;
};

export type SelectedVersion = {
    versionId: string;
    nodeId?: string;
};

export const AppStateProvider = ({ children }: Props) => {
    const [selectedContentId, setSelectedContentId] = useState<string>();
    const [selectedLocale, setSelectedLocale] = useState<Locale>('no');
    const [selectedVersion, setSelectedVersion] = useState<SelectedVersion>();

    useEffect(() => {
        const path = window.location.pathname;
        const matches = path.match(/\/xp\/([^/]+)\/([^/]+)/);

        if (matches) {
            const [, contentId, locale] = matches;
            setSelectedContentId(contentId);
            setSelectedLocale(locale as Locale);
        }
    }, []);

    const updateSelectedContent = useCallback(
        (selectedContent: string) => {
            setSelectedContentId(selectedContent);
            setSelectedVersion(undefined);
        },
        [setSelectedContentId]
    );

    const setSelectedLocaleMemoized = useCallback(setSelectedLocale, [setSelectedLocale]);

    const setSelectedVersionMemoized = useCallback(setSelectedVersion, [setSelectedVersion]);
    const selectedVersionMemoized = useMemo(() => selectedVersion, [selectedVersion]);

    return (
        <AppStateContext.Provider
            value={{
                selectedContentId,
                setSelectedContentId: updateSelectedContent,
                selectedVersion: selectedVersionMemoized,
                setSelectedVersion: setSelectedVersionMemoized,
                selectedLocale,
                setSelectedLocale: setSelectedLocaleMemoized,
            }}
        >
            {children}
        </AppStateContext.Provider>
    );
};
