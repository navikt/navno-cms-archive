import { useContext } from 'react';
import { AppStateContext } from './AppStateContext';

export const useAppState = () => {
    const {
        selectedContentId,
        selectedVersion,
        selectedLocale,
        updateSelectedContent,
        versionViewOpen,
        setVersionViewOpen,
    } = useContext(AppStateContext);

    return {
        selectedContentId,
        selectedVersion,
        selectedLocale,
        updateSelectedContent,
        versionViewOpen,
        setVersionViewOpen,
    };
};
