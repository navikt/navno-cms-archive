import { useContext } from 'react';
import { AppStateContext } from './AppStateContext';

export const useAppState = () => {
    const { contentId, setContentId } = useContext(AppStateContext);

    return {
        contentId,
        setContentId,
    };
};
