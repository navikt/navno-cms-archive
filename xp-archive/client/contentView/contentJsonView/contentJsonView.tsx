import React from 'react';
import { collapseAllNested, JsonView, darkStyles } from 'react-json-view-lite';
import { Content } from 'shared/types';
import 'react-json-view-lite/dist/index.css';
import style from './ContentJsonView.module.css';

type Props = {
    json: Content;
};

export const ContentJsonView = ({ json }: Props) => {
    return (
        <JsonView
            style={{ ...darkStyles, container: `${style.container}` }}
            data={json}
            clickToExpandNode={true}
            shouldExpandNode={collapseAllNested}
        />
    );
};
