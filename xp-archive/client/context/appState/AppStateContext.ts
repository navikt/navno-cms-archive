import { createContext } from 'react';

export type AppState = {
    selectedContentId?: string;
    selectedVersionId?: string;
    updateSelectedContent: (contentId: string | undefined, versionId?: string) => void;
};

export const AppStateContext = createContext<AppState>({
    updateSelectedContent: () => ({}),
});
