import React from 'react';
import { ToggleGroup, Tooltip, TooltipProps } from '@navikt/ds-react';
import { classNames } from '../../../utils/classNames';
import { CmsContent } from '../../../../common/cms-documents/content';

import style from './ViewSelector.module.css';

export type ViewState = 'html' | 'xml' | 'files' | 'export' | 'none';

type Props = {
    content: CmsContent;
    viewState: ViewState;
    setViewState: (viewState: ViewState) => void;
};

export const ViewSelector = ({ content, viewState, setViewState }: Props) => {
    const { html, binaries } = content;

    const filesCount = binaries.length;

    return (
        <ToggleGroup
            value={viewState}
            size={'small'}
            onChange={(e) => {
                setViewState(e as ViewState);
            }}
        >
            <WithTooltip tooltip={!html ? 'Innholdet har ingen nettside' : undefined}>
                <ToggleGroup.Item
                    value={'html'}
                    className={classNames(!html && style.disabled)}
                    onClick={(e) => {
                        if (!html) {
                            e.preventDefault();
                        }
                    }}
                >
                    {'Nettside'}
                </ToggleGroup.Item>
            </WithTooltip>
            {html && <ToggleGroup.Item value={'export'}>{'Eksporter'}</ToggleGroup.Item>}
            <WithTooltip tooltip={filesCount === 0 ? 'Innholdet har ingen filer' : undefined}>
                <ToggleGroup.Item
                    value={'files'}
                    className={classNames(filesCount === 0 && style.disabled)}
                    onClick={(e) => {
                        if (filesCount === 0) {
                            e.preventDefault();
                        }
                    }}
                >
                    {`Filer (${filesCount})`}
                </ToggleGroup.Item>
            </WithTooltip>
            <ToggleGroup.Item value={'xml'}>{'XML'}</ToggleGroup.Item>
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
