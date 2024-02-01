import React, { useCallback, useEffect, useState } from 'react';
import { AppContext } from '../../common/appContext';
import { AppTopSection } from './top-section/AppTopSection';
import { AppLeftSection } from './left-section/AppLeftSection';
import { AppMainSection } from './main-section/AppMainSection';
import { useAppState } from '../state/useAppState';
import { CmsContent } from '../../common/cms-documents/content';
import { CmsCategoryListItem } from '../../common/cms-documents/category';

import style from './App.module.css';

type Props = {
    appContext: AppContext;
};

export const App = ({ appContext }: Props) => {
    const [selectedContent, _setSelectedContent] = useState<CmsContent | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<CmsCategoryListItem | null>(null);
    const [contentSelectorOpen, setContentSelectorOpen] = useState<boolean>(false);

    const { AppStateProvider } = useAppState();

    const { cmsName } = appContext;

    const setSelectedContent = useCallback(
        (content: CmsContent | null, toHistory: boolean = true) => {
            _setSelectedContent(content);
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
            setSelectedContent(e.state?.content || null, false);
        };

        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, [setSelectedContent]);

    return (
        <AppStateProvider
            value={{
                appContext,
                selectedContent,
                setSelectedContent,
                selectedCategory,
                setSelectedCategory,
                contentSelectorOpen,
                setContentSelectorOpen,
            }}
        >
            <div className={style.root}>
                <AppTopSection cmsName={cmsName} />
                <AppLeftSection />
                <AppMainSection />
            </div>
        </AppStateProvider>
    );
};
