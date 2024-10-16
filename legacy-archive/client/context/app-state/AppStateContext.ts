import { createContext } from 'react';
import { AppContext, appErrorContext } from '../../../shared/appContext';
import { CmsContent } from '../../../shared/cms-documents/content';
import { CmsCategoryListItem } from '../../../shared/cms-documents/category';

type AppState = {
    appContext: AppContext;
    selectedContent: CmsContent | null;
    setSelectedContent: (content: CmsContent | null, toHistory?: boolean) => void;
    selectedCategory: CmsCategoryListItem | null;
    setSelectedCategory: (content: CmsCategoryListItem | null) => void;
    contentSelectorOpen: boolean;
    setContentSelectorOpen: (isOpen: boolean) => void;
};

export const AppStateContext = createContext<AppState>({
    appContext: appErrorContext,
    selectedContent: null,
    setSelectedContent: () => ({}),
    selectedCategory: null,
    setSelectedCategory: () => ({}),
    contentSelectorOpen: false,
    setContentSelectorOpen: () => ({}),
});
