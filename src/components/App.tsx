import React, { useEffect, useState } from 'react';
import { AppContext } from '../../common/appContext';
import { AppTopSection } from './top-section/AppTopSection';
import { AppLeftSection } from './left-section/AppLeftSection';
import { AppMainSection } from './main-section/AppMainSection';
import { useAppState } from '../state/useAppState';
import { CmsContentDocument } from '../../common/cms-documents/content';
import { fetchContentVersion } from '../utils/fetch/fetchContent';
import { CmsCategoryDocument } from '../../common/cms-documents/category';

import style from './App.module.css';

type Props = {
    context: AppContext;
};

export const App = ({ context }: Props) => {
    const [selectedContent, setSelectedContent] =
        useState<CmsContentDocument | null>(null);
    const [selectedCategory, setSelectedCategory] =
        useState<CmsCategoryDocument | null>(null);

    const { AppStateProvider } = useAppState();

    const { cmsName, selectedVersionKey, basePath } = context;

    useEffect(() => {
        if (!selectedVersionKey) {
            return;
        }

        fetchContentVersion(basePath)(selectedVersionKey).then((res) => {
            if (res) {
                setSelectedContent(res);
            }
        });
    }, [basePath, selectedVersionKey]);

    return (
        <AppStateProvider
            value={{
                appContext: context,
                selectedContent,
                setSelectedContent,
                selectedCategory,
                setSelectedCategory,
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
