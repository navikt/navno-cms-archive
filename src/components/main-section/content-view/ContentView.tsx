import React, { useState } from 'react';
import { CmsContentDocument } from '../../../../common/cms-documents/content.ts';
import { ToggleGroup } from '@navikt/ds-react';
import { XmlView } from './xml-view/XmlView.tsx';
import { HtmlView } from './html-view/HtmlView.tsx';

import style from './ContentView.module.css';

type ViewState = 'html' | 'xml';

type Props = { content: CmsContentDocument };

export const ContentView = ({ content }: Props) => {
    const { html, xmlAsString } = content;
    const initialState = html ? 'html' : 'xml';

    const [viewState, setViewState] = useState<ViewState>(initialState);

    return (
        <>
            <ToggleGroup
                defaultValue={initialState}
                onChange={(e) => {
                    setViewState(e as ViewState);
                }}
            >
                <ToggleGroup.Item value={'html'}>{'Vis HTML'}</ToggleGroup.Item>
                <ToggleGroup.Item value={'xml'}>{'Vis XML'}</ToggleGroup.Item>
            </ToggleGroup>
            <HtmlView html={html} hidden={viewState !== 'html'} />
            <XmlView xml={xmlAsString} hidden={viewState !== 'xml'} />
        </>
    );
};
