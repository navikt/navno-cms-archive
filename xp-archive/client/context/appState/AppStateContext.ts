import { createContext } from 'react';
import { SelectedVersion } from './AppStateProvider';
import { Locale } from 'client/contentTree/NavigationBar';

export type AppState = {
    selectedContentId?: string;
    setSelectedContentId: (contentId: string) => void;
    selectedLocale: Locale;
    setSelectedLocale: (locale: Locale) => void;
    selectedVersion?: SelectedVersion;
    setSelectedVersion: (selectedVersion: SelectedVersion | undefined) => void;
};

export const AppStateContext = createContext<AppState>({
    setSelectedContentId: () => ({}),
    selectedLocale: 'no',
    setSelectedLocale: () => ({}),
    setSelectedVersion: () => ({}),
});
