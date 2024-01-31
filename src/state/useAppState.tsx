import { createContext, useContext } from 'react';
import { AppContext, appErrorContext } from '../../common/appContext';
import { CmsContentDocument } from '../../common/cms-documents/content';
import { CmsCategoryDocument } from '../../common/cms-documents/category';

type AppState = {
    appContext: AppContext;
    selectedContent: CmsContentDocument | null;
    selectedCategory: CmsCategoryDocument | null;
    setSelectedContent: (content: CmsContentDocument | null) => void;
    setSelectedCategory: (content: CmsCategoryDocument | null) => void;
};

const AppStateContext = createContext<AppState>({
    appContext: appErrorContext,
    selectedContent: null,
    setSelectedContent: () => ({}),
    selectedCategory: null,
    setSelectedCategory: () => ({}),
});

export const useAppState = () => {
    const {
        appContext,
        selectedContent,
        setSelectedContent,
        selectedCategory,
        setSelectedCategory,
    } = useContext(AppStateContext);

    return {
        AppStateProvider: AppStateContext.Provider,
        appContext,
        selectedContent,
        setSelectedContent,
        selectedCategory,
        setSelectedCategory,
    };
};
