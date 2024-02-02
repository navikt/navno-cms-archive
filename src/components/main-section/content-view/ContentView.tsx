import React, { useEffect, useState } from 'react';
import { CmsContent } from '../../../../common/cms-documents/content';
import { XmlView } from './xml-view/XmlView';
import { HtmlView } from './html-view/HtmlView';
import { FilesView } from './files-view/FilesView';
import { ViewSelector, ViewState } from '../view-selector/ViewSelector';
import { VersionSelector } from './version-selector/VersionSelector';
import { Heading } from '@navikt/ds-react';
import { CategoriesPath } from '../../common/categories-path/CategoriesPath';

import style from './ContentView.module.css';

type Props = {
    content: CmsContent;
};

export const ContentView = ({ content }: Props) => {
    const { html, xmlAsString } = content;
    const [viewState, setViewState] = useState<ViewState>(getDefaultViewState(content));

    useEffect(() => {
        setViewState(getDefaultViewState(content));
    }, [content]);

    return (
        <>
            <CategoriesPath path={content.path} className={style.path} />
            <div className={style.top}>
                <div className={style.topLeft}>
                    <Heading size={'medium'} level={'2'} className={style.header}>
                        {content.displayName}
                    </Heading>
                    <ViewSelector
                        content={content}
                        viewState={viewState}
                        setViewState={setViewState}
                    />
                </div>
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

const getDefaultViewState = (content: CmsContent | null): ViewState => {
    if (!content) {
        return 'none';
    }

    const { html, binaries } = content;

    if (html) {
        return 'html';
    } else if (binaries && binaries.length > 0) {
        return 'files';
    } else {
        return 'xml';
    }
};
