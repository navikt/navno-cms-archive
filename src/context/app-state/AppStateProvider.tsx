import React, { useCallback, useEffect, useState } from 'react';
import { AppContext } from '../../../common/appContext';
import { CmsContent } from '../../../common/cms-documents/content';
import { CmsCategoryListItem } from '../../../common/cms-documents/category';
import { AppStateContext } from './AppStateContext';

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
