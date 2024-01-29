import React from 'react';
import { ContentView } from './content-view/ContentView.tsx';
import { useAppState } from '../../state/useAppState.tsx';
import { Heading } from '@navikt/ds-react';
import { ArrowLeftIcon } from '@navikt/aksel-icons';

import style from './AppMainSection.module.css';

export const AppMainSection = () => {
    const { selectedContent } = useAppState();

    return (
        <div className={style.mainContent}>
            <Heading size={'medium'} level={'2'} className={style.header}>
                {selectedContent ? (
                    selectedContent.displayName
                ) : (
                    <>
                        <ArrowLeftIcon />
                        {'Velg et innhold'}
                    </>
                )}
            </Heading>
            {selectedContent && <ContentView content={selectedContent} />}
        </div>
    );
};
