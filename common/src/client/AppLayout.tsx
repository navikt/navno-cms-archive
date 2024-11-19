import React from 'react';
import { AppTopSection } from './top-section/AppTopSection';

import style from './AppLayout.module.css';

type Props = {
    siteName: string; // TODO: Can this be removed?
    basePath: string;
    children: React.ReactNode;
    showUnderDevAlert?: boolean;
};

export const AppLayout = ({ basePath, children, showUnderDevAlert = false }: Props) => {
    return (
        <div className={style.root}>
            <AppTopSection basePath={basePath} showUnderDevAlert={showUnderDevAlert} />
            {children}
        </div>
    );
};
