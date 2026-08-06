import { useContext } from 'react';
import { AppStateContext } from './AppStateContext';

export const useAppState = () => {
    const { selectedContentId, selectedVersion, selectedLocale, updateSelectedContent } =
        useContext(AppStateContext);

    return {
        selectedContentId,
        selectedVersion,
        selectedLocale,
        updateSelectedContent,
    };
};
