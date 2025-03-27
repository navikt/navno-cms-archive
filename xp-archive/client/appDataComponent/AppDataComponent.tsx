import React from 'react';
import { SideView } from '../sideView/SideView';
import { Content } from '../content/Content';
import { useFetchContent } from '../hooks/useFetchContent';
import { useAppState } from '../context/appState/useAppState';

export const AppDataComponent = () => {
    const { selectedContentId, selectedLocale, selectedVersion } = useAppState();

    const { data, isLoading } = useFetchContent({
        id: selectedContentId ?? '',
        locale: selectedLocale ?? 'no',
        versionId: selectedVersion ?? '',
    });

    return (
        <>
            <SideView versions={data?.versions || []} />
            <Content data={data} isLoading={isLoading} />
        </>
    );
};
