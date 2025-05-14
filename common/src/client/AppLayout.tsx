import React from 'react';
import { AppTopSection } from './top-section/AppTopSection';

import style from './AppLayout.module.css';

type Props = {
    basePath: string;
    children: React.ReactNode;
};

export const AppLayout = ({ basePath, children }: Props) => {
    return (
        <div className={style.root}>
            <AppTopSection basePath={basePath} />
            {children}
        </div>
    );
};
