import { useContext } from 'react';
import { AppStateContext } from './AppStateContext';

export const useAppState = () => {
    const { selectedContentId, setSelectedContentId } = useContext(AppStateContext);

    return {
        selectedContentId,
        setSelectedContentId,
    };
};
