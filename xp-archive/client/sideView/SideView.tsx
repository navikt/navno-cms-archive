import React from 'react';
import { NavigationBar } from '../contentTree/NavigationBar';

import style from './SideView.module.css';

export const SideView = () => {
    return (
        <div className={style.wrapper}>
            <NavigationBar />
        </div>
    );
};
