import { createContext, useContext } from 'react';
import { AppContext, appErrorContext } from '../../common/appContext.ts';
import { CmsContentDocument } from '../../common/cms-documents/content.ts';

type AppState = {
    appContext: AppContext;
    selectedContent?: CmsContentDocument;
    setSelectedContent: (content: CmsContentDocument) => void;
};

const AppStateContext = createContext<AppState>({
    appContext: appErrorContext,
    setSelectedContent: () => ({}),
});

export const useAppState = () => {
    const { appContext, selectedContent, setSelectedContent } =
        useContext(AppStateContext);

    return {
        AppStateProvider: AppStateContext.Provider,
        appContext,
        selectedContent,
        setSelectedContent,
    };
};
