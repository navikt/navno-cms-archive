import React from 'react';
import { Tabs } from '@navikt/ds-react';
import { LayerPanel } from './layerPanel/LayerPanel';
import { useAppState } from 'client/context/appState/useAppState';
import { SearchSection, useSearch } from './search/SearchSection';
import style from './NavigationBar.module.css';

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
    const { searchResultIsOpen } = useSearch();

    return (
        <div className={style.wrapper}>
            <SearchSection />
            {!searchResultIsOpen && (
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
            )}
        </div>
    );
};
