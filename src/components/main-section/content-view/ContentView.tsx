import React, { useEffect, useState } from 'react';
import { CmsContentDocument } from '../../../../common/cms-documents/content.ts';
import { Select, ToggleGroup, Tooltip } from '@navikt/ds-react';
import { XmlView } from './xml-view/XmlView.tsx';
import { HtmlView } from './html-view/HtmlView.tsx';
import { classNames } from '../../../utils/classNames.ts';

import style from './ContentView.module.css';
import { useAppState } from '../../../state/useAppState.tsx';
import { fetchContentVersion } from '../../../utils/fetch/fetchContent.ts';

type ViewState = 'html' | 'xml';

type Props = { content: CmsContentDocument };

export const ContentView = ({ content }: Props) => {
    const { html, xmlAsString } = content;
    const initialState = html ? 'html' : 'xml';

    const [viewState, setViewState] = useState<ViewState>(initialState);

    const { setSelectedContent, appContext } = useAppState();

    useEffect(() => {
        if (!html) {
            setViewState('xml');
        }
    }, [html]);

    return (
        <>
            <div className={style.topRow}>
                <ToggleGroup
                    defaultValue={initialState}
                    onChange={(e) => {
                        setViewState(e as ViewState);
                    }}
                    className={style.toggle}
                    size={'medium'}
                    label={'Velg visning'}
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
                    <ToggleGroup.Item value={'xml'}>
                        {'Vis XML'}
                    </ToggleGroup.Item>
                </ToggleGroup>
                <Select
                    label={'Velg versjon'}
                    onChange={(e) => {
                        fetchContentVersion(appContext.basePath)(
                            e.target.value
                        ).then((res) => {
                            if (res) {
                                setSelectedContent(res);
                            }
                        });
                    }}
                >
                    {content.versions?.map((version) => (
                        <option value={version.key} key={version.key}>
                            {`${new Date(version.timestamp || '').toLocaleString('no')} - ${version.title} [${version.key}]`}
                        </option>
                    ))}
                </Select>
            </div>
            <HtmlView html={html} hidden={viewState !== 'html'} />
            <XmlView xml={xmlAsString} hidden={viewState !== 'xml'} />
        </>
    );
};
