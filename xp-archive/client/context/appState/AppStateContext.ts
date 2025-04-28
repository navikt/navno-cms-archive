import { createContext } from 'react';
import { SelectedContent } from './AppStateProvider';

export type AppState = {
    selectedContentId?: string;
    selectedLocale?: string;
    selectedVersion?: string;
    updateSelectedContent: (selectedContent: SelectedContent) => void;
    versionViewOpen: boolean;
    setVersionViewOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AppStateContext = createContext<AppState>({
    updateSelectedContent: () => ({}),
    versionViewOpen: false,
    setVersionViewOpen: () => ({}),
});
