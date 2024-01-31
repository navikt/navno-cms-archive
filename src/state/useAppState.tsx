import { createContext, useContext } from 'react';
import { AppContext, appErrorContext } from '../../common/appContext';
import { CmsContentDocument } from '../../common/cms-documents/content';
import { CmsCategoryListItem } from '../../common/cms-documents/category';

type AppState = {
    appContext: AppContext;
    selectedContent: CmsContentDocument | null;
    setSelectedContent: (content: CmsContentDocument | null) => void;
    selectedCategory: CmsCategoryListItem | null;
    setSelectedCategory: (content: CmsCategoryListItem | null) => void;
    contentSelectorOpen: boolean;
    setContentSelectorOpen: (isOpen: boolean) => void;
};

// eslint-disable-next-line react-refresh/only-export-components
const AppStateContext = createContext<AppState>({
    appContext: appErrorContext,
    selectedContent: null,
    setSelectedContent: () => ({}),
    selectedCategory: null,
    setSelectedCategory: () => ({}),
    contentSelectorOpen: false,
    setContentSelectorOpen: () => ({}),
});

export const useAppState = () => {
    const {
        appContext,
        selectedContent,
        setSelectedContent,
        selectedCategory,
        setSelectedCategory,
        contentSelectorOpen,
        setContentSelectorOpen,
    } = useContext(AppStateContext);

    return {
        AppStateProvider: AppStateContext.Provider,
        appContext,
        selectedContent,
        setSelectedContent,
        selectedCategory,
        setSelectedCategory,
        contentSelectorOpen,
        setContentSelectorOpen,
    };
};
