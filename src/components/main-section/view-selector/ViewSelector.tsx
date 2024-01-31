import React from 'react';
import { ToggleGroup, Tooltip, TooltipProps } from '@navikt/ds-react';
import style from '../content-view/ContentView.module.css';
import { classNames } from '../../../utils/classNames';
import { CmsContentDocument } from '../../../../common/cms-documents/content';

export type ViewState = 'html' | 'xml' | 'files';

type Props = {
    content: CmsContentDocument;
    viewState: ViewState;
    setViewState: (viewState: ViewState) => void;
};

export const ViewSelector = ({ content, viewState, setViewState }: Props) => {
    const { html, binaries } = content;

    const filesCount = binaries.length;

    return (
        <ToggleGroup
            value={viewState}
            className={style.toggle}
            size={'small'}
            onChange={(e) => {
                setViewState(e as ViewState);
            }}
        >
            <WithTooltip
                tooltip={!html ? 'Innholdet har ingen nettside' : undefined}
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
            </WithTooltip>
            <WithTooltip
                tooltip={
                    filesCount === 0 ? 'Innholdet har ingen filer' : undefined
                }
            >
                <ToggleGroup.Item
                    value={'files'}
                    className={classNames(filesCount === 0 && style.disabled)}
                    onClick={(e) => {
                        if (filesCount === 0) {
                            e.preventDefault();
                        }
                    }}
                >
                    {`Vis filer (${filesCount})`}
                </ToggleGroup.Item>
            </WithTooltip>
            <ToggleGroup.Item value={'xml'}>{'Vis XML'}</ToggleGroup.Item>
        </ToggleGroup>
    );
};

const WithTooltip = ({
    tooltip,
    children,
}: {
    tooltip?: string;
    children: TooltipProps['children'];
}) => {
    if (!tooltip) {
        return children;
    }

    return (
        <Tooltip content={tooltip} placement={'bottom'}>
            {children}
        </Tooltip>
    );
};
