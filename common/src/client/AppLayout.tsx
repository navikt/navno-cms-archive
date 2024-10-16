import React from 'react';
import { AppTopSection } from './top-section/AppTopSection';

import style from './AppLayout.module.css';

type Props = {
    siteName: string;
    basePath: string;
    children: React.ReactNode;
};

export const AppLayout = ({ siteName, basePath, children }: Props) => {
    return (
        <div className={style.root}>
            <AppTopSection basePath={basePath} siteName={siteName} />
            {children}
        </div>
    );
};
