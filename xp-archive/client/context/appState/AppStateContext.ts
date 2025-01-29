import { createContext } from 'react';
import { Locale } from 'client/contentTree/NavigationBar';

export type AppState = {
    selectedContentId?: string;
    setSelectedContentId: (contentId: string) => void;
    selectedLocale: Locale;
    setSelectedLocale: (locale: Locale) => void;
    selectedVersion?: string;
    setSelectedVersion: (versionId: string) => void;
};

export const AppStateContext = createContext<AppState>({
    setSelectedContentId: () => ({}),
    selectedLocale: 'no',
    setSelectedLocale: () => ({}),
    setSelectedVersion: () => ({}),
});
