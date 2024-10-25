import React from 'react';
import { ToggleGroup } from '@navikt/ds-react';
import style from './ViewSelector.module.css';

const viewVariants = ['html', 'json', 'files'] as const;
export type ViewVariant = (typeof viewVariants)[number];

const getDisplayname = (viewVariant: ViewVariant) => {
    const translations: Record<ViewVariant, string> = {
        html: 'Nettside',
        json: 'JSON',
        files: 'Filer',
    };
    return translations[viewVariant];
};

type Props = {
    selectedView: ViewVariant;
    setSelectedView(selectedView: ViewVariant): void;
    hasHtml: boolean;
};

export const ViewSelector = ({ selectedView, setSelectedView, hasHtml }: Props) => {
    const updateSelectedView = (viewVariantString: string) => {
        const viewVariant = viewVariantString as ViewVariant;
        if (viewVariant === 'html' && !hasHtml) {
            return;
        }
        setSelectedView(viewVariant);
    };

    return (
        <ToggleGroup size={'small'} value={selectedView} onChange={updateSelectedView}>
            {viewVariants.map((view) => (
                <ToggleGroup.Item
                    key={view}
                    value={view}
                    className={`${view === 'html' && !hasHtml ? style.disabled : ''}`}
                >
                    {getDisplayname(view)}
                </ToggleGroup.Item>
            ))}
        </ToggleGroup>
    );
};
