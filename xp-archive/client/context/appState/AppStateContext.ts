import { createContext } from 'react';

export type AppState = {
    selectedContentId?: string;
    setSelectedContentId: (contentId: string) => void;
};

export const AppStateContext = createContext<AppState>({ setSelectedContentId: () => ({}) });
