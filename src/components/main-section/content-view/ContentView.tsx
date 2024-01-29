import React, { useEffect, useState } from 'react';
import { CmsContentDocument } from '../../../../common/cms-documents/content.ts';
import { XmlView } from './xml-view/XmlView.tsx';
import { HtmlView } from './html-view/HtmlView.tsx';
import { FilesView } from './files-view/FilesView.tsx';
import { VersionSelector } from './version-selector/VersionSelector.tsx';
import { useAppState } from '../../../state/useAppState.tsx';
import { ViewSelector, ViewState } from '../view-selector/ViewSelector.tsx';

import style from './ContentView.module.css';

type Props = { content: CmsContentDocument };

export const ContentView = ({ content }: Props) => {
    const { html, xmlAsString } = content;

    const { appContext } = useAppState();

    const [viewState, setViewState] = useState<ViewState>(
        getDefaultViewState(content)
    );

    useEffect(() => {
        // TODO: implement actual navigation state
        window.history.replaceState(
            {},
            '',
            `${window.location.origin}${appContext.basePath}/${content.versionKey}`
        );
        setViewState(getDefaultViewState(content));
    }, [content, appContext]);

    return (
        <>
            <div className={style.topRow}>
                <ViewSelector
                    content={content}
                    viewState={viewState}
                    setViewState={setViewState}
                />
                <VersionSelector content={content} />
            </div>
            <XmlView xml={xmlAsString} hidden={viewState !== 'xml'} />
            {html && <HtmlView html={html} hidden={viewState !== 'html'} />}
            {content.binaries && (
                <FilesView
                    binaries={content.binaries}
                    hidden={viewState !== 'files'}
                />
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
