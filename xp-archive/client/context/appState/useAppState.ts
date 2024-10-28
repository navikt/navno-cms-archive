import { useContext } from 'react';
import { AppStateContext } from './AppStateContext';

export const useAppState = () => {
    const { selectedContentId, setSelectedContentId, selectedVersionId, setSelectedVersionId } =
        useContext(AppStateContext);

    return {
        selectedContentId,
        setSelectedContentId,
        selectedVersionId,
        setSelectedVersionId,
    };
};
