import React, { useState } from 'react';
import { AppContext } from '../../common/appContext.ts';
import { AppTopSection } from './top-section/AppTopSection.tsx';
import { AppLeftSection } from './left-section/AppLeftSection.tsx';
import { AppMainSection } from './main-section/AppMainSection.tsx';
import { useAppState } from '../state/useAppState.tsx';
import { CmsContentDocument } from '../../common/cms-documents/content.ts';

import style from './App.module.css';

type Props = {
    context: AppContext;
};

export const App = ({ context }: Props) => {
    const [selectedContent, setSelectedContent] = useState<
        CmsContentDocument | undefined
    >();

    const { cmsName } = context;

    const { AppStateProvider } = useAppState();

    return (
        <AppStateProvider
            value={{ appContext: context, selectedContent, setSelectedContent }}
        >
            <div className={style.root}>
                <AppTopSection cmsName={cmsName} />
                <AppLeftSection context={context} />
                <AppMainSection />
            </div>
        </AppStateProvider>
    );
};
