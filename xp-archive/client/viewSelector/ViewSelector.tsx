import React from 'react';
import { ToggleGroup } from '@navikt/ds-react';
import style from './ViewSelector.module.css';

export type ViewVariant = 'html' | 'pdf' | 'filepreview';

const getDisplayname = (viewVariant: ViewVariant) => {
    const translations: Record<ViewVariant, string> = {
        html: 'HTML',
        filepreview: 'Forhåndsvisning',
        pdf: 'PDF',
    };
    return translations[viewVariant];
};

function getRelevantViewVariants(isWebpage: boolean, hasAttachment: boolean): ViewVariant[] {
    if (isWebpage) return ['html', 'pdf'];
    if (hasAttachment) return ['filepreview'];
    return [];
}

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

    const relevantViewVariants = getRelevantViewVariants(isWebpage, hasAttachment);

    return (
        <ToggleGroup
            className={style.datatheme}
            data-theme="viewSelector"
            label={'Visning'}
            size={'small'}
            value={selectedView}
            onChange={updateSelectedView}
        >
            {relevantViewVariants.map((view) => (
                <ToggleGroup.Item key={view} value={view}>
                    {getDisplayname(view)}
                </ToggleGroup.Item>
            ))}
        </ToggleGroup>
    );
};
