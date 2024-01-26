import React, { useEffect, useState } from 'react';
import { CmsContentDocument } from '../../../../common/cms-documents/content.ts';
import { ToggleGroup, Tooltip } from '@navikt/ds-react';
import { XmlView } from './xml-view/XmlView.tsx';
import { HtmlView } from './html-view/HtmlView.tsx';
import { classNames } from '../../../utils/classNames.ts';

import style from './ContentView.module.css';

type ViewState = 'html' | 'xml';

type Props = { content: CmsContentDocument };

export const ContentView = ({ content }: Props) => {
    const { html, xmlAsString } = content;
    const initialState = html ? 'html' : 'xml';

    const [viewState, setViewState] = useState<ViewState>(initialState);

    useEffect(() => {
        if (!html) {
            setViewState('xml');
        }
    }, [html]);

    return (
        <>
            <ToggleGroup
                defaultValue={initialState}
                onChange={(e) => {
                    setViewState(e as ViewState);
                }}
                className={style.toggle}
                size={'small'}
            >
                <ToggleGroup.Item
                    value={'html'}
                    className={classNames(!html && style.disabled)}
                    onClick={(e) => {
                        if (!html) {
                            e.preventDefault();
                        }
                    }}
                >
                    {'Vis nettside'}
                </ToggleGroup.Item>
                <ToggleGroup.Item value={'xml'}>{'Vis XML'}</ToggleGroup.Item>
            </ToggleGroup>
            <HtmlView html={html} hidden={viewState !== 'html'} />
            <XmlView xml={xmlAsString} hidden={viewState !== 'xml'} />
        </>
    );
};
