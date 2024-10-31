import React from 'react';
import { ToggleGroup } from '@navikt/ds-react';
import style from './ViewSelector.module.css';

const viewVariants = ['preview', 'json'] as const;
export type ViewVariant = (typeof viewVariants)[number];

const getDisplayname = (viewVariant: ViewVariant) => {
    const translations: Record<ViewVariant, string> = {
        preview: 'Forhåndsvisning',
        json: 'JSON',
    };
    return translations[viewVariant];
};

type Props = {
    selectedView: ViewVariant;
    setSelectedView(selectedView: ViewVariant): void;
    hasPreview: boolean;
};

export const ViewSelector = ({ selectedView, setSelectedView, hasPreview }: Props) => {
    const updateSelectedView = (viewVariantString: string) => {
        const viewVariant = viewVariantString as ViewVariant;
        if (viewVariant === 'preview' && !hasPreview) {
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
                    className={`${view === 'preview' && !hasPreview ? style.disabled : ''}`}
                >
                    {getDisplayname(view)}
                </ToggleGroup.Item>
            ))}
        </ToggleGroup>
    );
};
