import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppContext, appErrorContext } from '../../common/appContext';
import { CmsContent } from '../../common/cms-documents/content';
import { CmsCategoryListItem } from '../../common/cms-documents/category';

type AppState = {
    appContext: AppContext;
    selectedContent: CmsContent | null;
    setSelectedContent: (content: CmsContent | null, toHistory?: boolean) => void;
    selectedCategory: CmsCategoryListItem | null;
    setSelectedCategory: (content: CmsCategoryListItem | null) => void;
    contentSelectorOpen: boolean;
    setContentSelectorOpen: (isOpen: boolean) => void;
};

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
    return useContext(AppStateContext);
};

type ProviderProps = {
    appContext: AppContext;
    children: React.ReactNode;
};

export const AppStateProvider = ({ appContext, children }: ProviderProps) => {
    const [selectedContent, setSelectedContent] = useState<CmsContent | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<CmsCategoryListItem | null>(null);
    const [contentSelectorOpen, setContentSelectorOpen] = useState<boolean>(false);

    const setSelectedContentWithHistory = useCallback(
        (content: CmsContent | null, toHistory: boolean = true) => {
            setSelectedContent(content);
            if (toHistory) {
                window.history.pushState(
                    { ...window.history.state, content },
                    '',
                    `${appContext.basePath}/${content ? content.versionKey : ''}`
                );
            }
        },
        [appContext]
    );

    useEffect(() => {
        const onPopState = (e: PopStateEvent) => {
            setSelectedContentWithHistory(e.state?.content || null, false);
        };

        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, [setSelectedContentWithHistory]);

    return (
        <AppStateContext.Provider
            value={{
                appContext,
                selectedContent,
                setSelectedContent: setSelectedContentWithHistory,
                selectedCategory,
                setSelectedCategory,
                contentSelectorOpen,
                setContentSelectorOpen,
            }}
        >
            {children}
        </AppStateContext.Provider>
    );
};
