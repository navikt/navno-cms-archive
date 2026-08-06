import { createContext } from 'react';
import { SelectedContent } from './AppStateProvider';

export type AppState = {
    selectedContentId?: string;
    selectedLocale?: string;
    selectedVersion?: string;
    updateSelectedContent: (selectedContent: SelectedContent) => void;
};

export const AppStateContext = createContext<AppState>({
    updateSelectedContent: () => ({}),
});
