import React, { useEffect, useState } from 'react';
import { CmsContentDocument } from '../../../../common/cms-documents/content.ts';
import { ToggleGroup } from '@navikt/ds-react';
import { XmlView } from './xml-view/XmlView.tsx';
import { HtmlView } from './html-view/HtmlView.tsx';
import { classNames } from '../../../utils/classNames.ts';
import { FilesView } from './files-view/FilesView.tsx';
import { VersionSelector } from './version-selector/VersionSelector.tsx';
import { useAppState } from '../../../state/useAppState.tsx';

import style from './ContentView.module.css';

type ViewState = 'html' | 'xml' | 'files';

type Props = { content: CmsContentDocument };

const getDefaultViewState = ({ html, binaries }: CmsContentDocument) => {
    if (html) {
        return 'html';
    } else if (binaries && binaries.length > 0) {
        return 'files';
    } else {
        return 'xml';
    }
};

export const ContentView = ({ content }: Props) => {
    const { html, xmlAsString, binaries } = content;

    const { appContext } = useAppState();

    const [viewState, setViewState] = useState<ViewState>(
        getDefaultViewState(content)
    );

    const filesCount = !binaries || binaries.length === 0 ? 0 : binaries.length;

    useEffect(() => {
        if (!content) {
            return;
        }

        // TODO: implement actual navigation state
        window.history.replaceState(
            {},
            '',
            `${window.location.origin}${appContext.basePath}/${content.contentKey}`
        );
        setViewState(getDefaultViewState(content));
    }, [content]);

    return (
        <>
            <div className={style.topRow}>
                <ToggleGroup
                    value={viewState}
                    className={style.toggle}
                    size={'medium'}
                    onChange={(e) => {
                        setViewState(e as ViewState);
                    }}
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
                    <ToggleGroup.Item
                        value={'files'}
                        className={classNames(
                            filesCount === 0 && style.disabled
                        )}
                        onClick={(e) => {
                            if (filesCount === 0) {
                                e.preventDefault();
                            }
                        }}
                    >
                        {`Vis filer (${filesCount})`}
                    </ToggleGroup.Item>
                    <ToggleGroup.Item value={'xml'}>
                        {'Vis XML'}
                    </ToggleGroup.Item>
                </ToggleGroup>
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
