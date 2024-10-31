import React from 'react';
import { Alert, Heading, Tabs } from '@navikt/ds-react';
import { LayerPanel } from './layerPanel/LayerPanel';
import { useAppState } from 'client/context/appState/useAppState';

const locales = ['no', 'en', 'nn', 'se'] as const;
export type Locale = (typeof locales)[number];

const getLabel = (locale: Locale) => {
    const translations: Record<Locale, string> = {
        no: 'Norsk',
        en: 'Engelsk',
        nn: 'Nynorsk',
        se: 'Samisk',
    };
    return translations[locale];
};

export const NavigationBar = () => {
    const { setSelectedLocale } = useAppState();

    return (
        <div>
            <Alert
                variant={'warning'}
                size={'small'}
                inline={true}
                style={{ marginBottom: '1rem' }}
            >
                {'Obs: dette arkivet er under utvikling og er ikke klart til bruk!'}
            </Alert>
            <Heading size={'small'}>{'Innhold'}</Heading>
            <Tabs defaultValue="no" onChange={(locale) => setSelectedLocale(locale as Locale)}>
                <Tabs.List>
                    {locales.map((locale) => (
                        <Tabs.Tab key={locale} value={locale} label={getLabel(locale)} />
                    ))}
                </Tabs.List>
                {locales.map((locale) => (
                    <Tabs.Panel key={locale} value={locale}>
                        <LayerPanel locale={locale} />
                    </Tabs.Panel>
                ))}
            </Tabs>
        </div>
    );
};
