import React from 'react';
import { ToggleGroup } from '@navikt/ds-react';

export type ViewVariant = 'html' | 'pdf' | 'json' | 'filepreview';

const getDisplayname = (viewVariant: ViewVariant) => {
    const translations: Record<ViewVariant, string> = {
        html: 'HTML',
        filepreview: 'Forhåndsvisning',
        pdf: 'PDF',
        json: 'JSON',
    };
    return translations[viewVariant];
};

type Props = {
    selectedView: ViewVariant;
    setSelectedView(selectedView: ViewVariant): void;
    hasAttachment: boolean;
    isWebpage: boolean;
};

export const ViewSelector = ({
    selectedView,
    setSelectedView,
    hasAttachment,
    isWebpage,
}: Props) => {
    const updateSelectedView = (viewVariantString: string) => {
        const viewVariant = viewVariantString as ViewVariant;
        setSelectedView(viewVariant);
    };

    const relevantViewVariants: ViewVariant[] = isWebpage
        ? ['html', 'pdf', 'json']
        : hasAttachment
          ? ['filepreview', 'json']
          : ['json'];

    return (
        <ToggleGroup size={'small'} value={selectedView} onChange={updateSelectedView}>
            {relevantViewVariants.map((view) => (
                <ToggleGroup.Item key={view} value={view}>
                    {getDisplayname(view)}
                </ToggleGroup.Item>
            ))}
        </ToggleGroup>
    );
};
