import { useContext } from 'react';
import { AppStateContext } from './AppStateContext';

export const useAppState = () => {
    const { selectedContentId, selectedVersion, setSelectedContentId, setSelectedVersion } =
        useContext(AppStateContext);

    return {
        selectedContentId,
        selectedVersion,
        setSelectedContentId,
        setSelectedVersion,
    };
};
