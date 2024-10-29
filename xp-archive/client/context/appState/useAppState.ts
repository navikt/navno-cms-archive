import { useContext } from 'react';
import { AppStateContext } from './AppStateContext';

export const useAppState = () => {
    const { selectedContentId, selectedVersionId, updateSelectedContent } =
        useContext(AppStateContext);

    return {
        selectedContentId,
        selectedVersionId,
        updateSelectedContent,
    };
};
