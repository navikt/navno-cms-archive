import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { AppStateContext } from './AppStateContext';
import { Locale } from 'client/contentTree/NavigationBar';
import { useParams } from 'react-router-dom';

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

    const { contentId, locale } = useParams<{ contentId: string; locale: Locale }>();

    useEffect(() => {
        if (contentId && locale) {
            setSelectedContentId(contentId);
            setSelectedLocale(locale);
        }
    }, [contentId, locale]);

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
