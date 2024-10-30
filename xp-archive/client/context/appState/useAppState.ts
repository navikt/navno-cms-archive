import { useContext } from 'react';
import { AppStateContext } from './AppStateContext';

export const useAppState = () => {
    const {
        selectedContentId,
        selectedVersion,
        selectedLocale,
        setSelectedLocale,
        setSelectedContentId,
        setSelectedVersion,
    } = useContext(AppStateContext);

    return {
        selectedContentId,
        selectedVersion,
        selectedLocale,
        setSelectedLocale,
        setSelectedContentId,
        setSelectedVersion,
    };
};
