import React, { useRef } from 'react';
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

    const cacheVersions = useRef(data?.versions);
    const versions = isLoading ? cacheVersions.current : data?.versions;

    return (
        <>
            <SideView versions={versions || []} />
            <Content data={data} isLoading={isLoading} />
        </>
    );
};
