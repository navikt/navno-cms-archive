import { useContext } from 'react';
import { SearchStateContext } from './SearchStateContext';

export const useSearchState = () => {
    return useContext(SearchStateContext);
};
