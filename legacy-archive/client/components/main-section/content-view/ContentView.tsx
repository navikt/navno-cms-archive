import React, { useEffect, useState } from 'react';
import { ExternalLinkIcon } from '@navikt/aksel-icons';
import { useAppState } from 'client/context/app-state/useAppState';
import { CmsContent } from '../../../../shared/cms-documents/content';
import { XmlView } from './xml-view/XmlView';
import { HtmlView } from './html-view/HtmlView';
import { FilesView } from './files-view/FilesView';
import { ViewSelector, ViewState } from '../view-selector/ViewSelector';
import { VersionSelector } from './version-selector/VersionSelector';
import { Button, Heading } from '@navikt/ds-react';
import { CategoriesPath } from '../../common/categories-path/CategoriesPath';
import { PdfExporter } from './pdf-exporter/PdfExporter';

import style from './ContentView.module.css';

type Props = {
    content: CmsContent;
};

export const ContentView = ({ content }: Props) => {
    const { html, xmlAsString, versionKey } = content;
    const [viewState, setViewState] = useState<ViewState>(getDefaultViewState(content));

    useEffect(() => {
        setViewState(getDefaultViewState(content));
    }, [content]);

    const { appContext } = useAppState();
    const fullscreenPath = `${appContext.basePath}/html/${versionKey}`;

    return (
        <>
            <CategoriesPath path={content.path} className={style.path} />
            <div className={style.top}>
                <div className={style.topLeft}>
                    <Heading size={'medium'} level={'2'} className={style.header}>
                        {content.displayName}
                    </Heading>
                    <div className={style.viewSelectorWrapper}>
                        <ViewSelector
                            content={content}
                            viewState={viewState}
                            setViewState={setViewState}
                        />
                        <Button
                            size={'small'}
                            variant={'primary'}
                            as={'a'}
                            href={fullscreenPath}
                            icon={<ExternalLinkIcon />}
                            iconPosition={'right'}
                            onClick={(e) => {
                                e.preventDefault();
                                window.open(fullscreenPath, '_blank');
                            }}
                        >
                            {'Åpne i nytt vindu'}
                        </Button>
                    </div>
                </div>
                <VersionSelector content={content} />
            </div>
            <XmlView xml={xmlAsString} hidden={viewState !== 'xml'} />
            {html && (
                <>
                    <HtmlView html={html} versionKey={versionKey} hidden={viewState !== 'html'} />
                    <PdfExporter content={content} hidden={viewState !== 'export'} />
                </>
            )}
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
