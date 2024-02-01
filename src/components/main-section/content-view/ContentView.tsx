import React, { useEffect, useState } from 'react';
import { CmsContentDocument } from '../../../../common/cms-documents/content';
import { XmlView } from './xml-view/XmlView';
import { HtmlView } from './html-view/HtmlView';
import { FilesView } from './files-view/FilesView';
import { VersionSelector } from './version-selector/VersionSelector';
import { ViewSelector, ViewState } from '../view-selector/ViewSelector';

import style from './ContentView.module.css';

type Props = { content: CmsContentDocument };

export const ContentView = ({ content }: Props) => {
    const { html, xmlAsString } = content;

    const [viewState, setViewState] = useState<ViewState>(getDefaultViewState(content));

    useEffect(() => {
        setViewState(getDefaultViewState(content));
    }, [content]);

    return (
        <>
            <div className={style.topRow}>
                <ViewSelector content={content} viewState={viewState} setViewState={setViewState} />
                <VersionSelector content={content} />
            </div>
            <XmlView xml={xmlAsString} hidden={viewState !== 'xml'} />
            {html && <HtmlView html={html} hidden={viewState !== 'html'} />}
            {content.binaries && (
                <FilesView binaries={content.binaries} hidden={viewState !== 'files'} />
            )}
        </>
    );
};

const getDefaultViewState = ({ html, binaries }: CmsContentDocument) => {
    if (html) {
        return 'html';
    } else if (binaries && binaries.length > 0) {
        return 'files';
    } else {
        return 'xml';
    }
};
