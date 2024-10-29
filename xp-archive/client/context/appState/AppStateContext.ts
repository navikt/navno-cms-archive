import { createContext } from 'react';

export type AppState = {
    selectedContentId?: string;
    setSelectedContentId: (contentId: string) => void;
    selectedVersionId?: string;
    setSelectedVersionId: (versionId: string | undefined) => void;
};

export const AppStateContext = createContext<AppState>({
    setSelectedContentId: () => ({}),
    setSelectedVersionId: () => ({}),
});
