import { createContext } from 'react';
import { SelectedVersion } from './AppStateProvider';

export type AppState = {
    selectedContentId?: string;
    setSelectedContentId: (contentId: string) => void;
    selectedVersion?: SelectedVersion;
    setSelectedVersion: (selectedVersion: SelectedVersion | undefined) => void;
};

export const AppStateContext = createContext<AppState>({
    setSelectedContentId: () => ({}),
    setSelectedVersion: () => ({}),
});
