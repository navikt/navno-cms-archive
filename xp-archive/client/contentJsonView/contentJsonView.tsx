import React from 'react';
import { collapseAllNested, JsonView } from 'react-json-view-lite';
import { Content } from 'shared/types';
import 'react-json-view-lite/dist/index.css';

import style from './ContentJsonView.module.css';

type Props = {
    json: Content;
};

export const ContentJsonView = ({ json }: Props) => {
    return (
        <div className={style.wrapper}>
            <JsonView data={json} clickToExpandNode={true} shouldExpandNode={collapseAllNested} />
        </div>
    );
};
