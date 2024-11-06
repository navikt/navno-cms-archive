import React from 'react';
import { ToggleGroup } from '@navikt/ds-react';
import style from './ViewSelector.module.css';

const viewVariants = ['preview', 'pdf', 'json'] as const;
export type ViewVariant = (typeof viewVariants)[number];

const getDisplayname = (viewVariant: ViewVariant) => {
    const translations: Record<ViewVariant, string> = {
        preview: 'Forhåndsvisning',
        pdf: 'PDF',
        json: 'JSON',
    };
    return translations[viewVariant];
};

type Props = {
    selectedView: ViewVariant;
    setSelectedView(selectedView: ViewVariant): void;
    hasPreview: boolean;
    isWebpage: boolean;
};

export const ViewSelector = ({ selectedView, setSelectedView, hasPreview, isWebpage }: Props) => {
    const updateSelectedView = (viewVariantString: string) => {
        const viewVariant = viewVariantString as ViewVariant;
        if (viewVariant === 'preview' && !hasPreview) {
            return;
        }
        setSelectedView(viewVariant);
    };

    return (
        <ToggleGroup size={'small'} value={selectedView} onChange={updateSelectedView}>
            {viewVariants
                .filter((v) => !(!isWebpage && v === 'pdf'))
                .map((view) => (
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
