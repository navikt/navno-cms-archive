import React, { useEffect } from 'react';
import { SideView } from '../sideView/SideView';
import { Content } from '../content/Content';
import { useFetchContent } from '../hooks/useFetchContent';
import { useAppState } from '../context/appState/useAppState';

export const AppDataComponent = () => {
    const { selectedContentId, selectedLocale, selectedVersion, updateSelectedContent } =
        useAppState();

    useEffect(() => {
        const pathSegments = window.location.pathname.split('/');
        const contentId = pathSegments?.[2];
        const locale = pathSegments?.[3];
        const versionId = pathSegments?.[4];
        if (contentId && contentId !== selectedContentId) {
            updateSelectedContent({ contentId, locale, versionId: versionId || undefined });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
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
