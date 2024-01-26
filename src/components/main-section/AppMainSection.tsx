import React from 'react';
import { ContentView } from './content-view/ContentView.tsx';
import { useAppState } from '../../state/useAppState.tsx';

import style from './AppMainSection.module.css';

export const AppMainSection = () => {
    const { selectedContent } = useAppState();

    return (
        <div className={style.mainContent}>
            {selectedContent && <ContentView content={selectedContent} />}
        </div>
    );
};
