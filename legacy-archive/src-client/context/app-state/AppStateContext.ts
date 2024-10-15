import { createContext } from 'react';
import { AppContext, appErrorContext } from '../../../src-common/appContext';
import { CmsContent } from '../../../src-common/cms-documents/content';
import { CmsCategoryListItem } from '../../../src-common/cms-documents/category';

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
