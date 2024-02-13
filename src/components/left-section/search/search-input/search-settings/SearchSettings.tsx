import React from 'react';
import { Button, HelpText, Label, Radio, RadioGroup } from '@navikt/ds-react';
import { ChevronDownIcon, XMarkIcon } from '@navikt/aksel-icons';
import { classNames } from '../../../../../utils/classNames';
import { useSearchState } from '../../../../../context/search-state/useSearchState';

import style from './SearchSettings.module.css';

export const SearchSettings = () => {
    const {
        searchParams,
        updateSearchParams,
        resetSearchSettings,
        searchSettingsIsOpen,
        setSearchSettingsIsOpen,
    } = useSearchState();

    const { sort, type, isCustom } = searchParams;

    return (
        <div className={style.container}>
            <div className={style.topRow}>
                <Label size={'small'}>{'Søk'}</Label>
                <div className={style.topRight}>
                    {searchSettingsIsOpen && (
                        <HelpText title={'Tips!'}>
                            {
                                'Du kan avgrense søket til enkelte hovedkategorier med sjekkboksene til venstre i menyen.'
                            }
                        </HelpText>
                    )}
                    {isCustom && (
                        <Button
                            size={'xsmall'}
                            variant={'tertiary'}
                            className={style.toggle}
                            onClick={resetSearchSettings}
                        >
                            {'Nullstill'}
                            <XMarkIcon />
                        </Button>
                    )}
                    <Button
                        size={'xsmall'}
                        variant={'tertiary'}
                        className={style.toggle}
                        onClick={() => setSearchSettingsIsOpen(!searchSettingsIsOpen)}
                    >
                        {'Tilpass søket'}
                        <ChevronDownIcon
                            className={classNames(style.icon, searchSettingsIsOpen && style.open)}
                        />
                    </Button>
                </div>
            </div>
            <div className={classNames(style.settings, searchSettingsIsOpen && style.open)}>
                <div className={style.radioGroups}>
                    <RadioGroup
                        size={'small'}
                        legend={'Søk etter...'}
                        value={type || 'titles'}
                        onChange={(value) => updateSearchParams({ type: value })}
                    >
                        <Radio value={'titles'}>{'Tittel'}</Radio>
                        <Radio value={'locations'}>{'URL'}</Radio>
                        <Radio value={'all'}>{'Alt innhold'}</Radio>
                    </RadioGroup>
                    <RadioGroup
                        size={'small'}
                        legend={'Sortering'}
                        value={sort || 'score'}
                        onChange={(value) => updateSearchParams({ sort: value })}
                    >
                        <Radio value={'score'}>{'Beste treff'}</Radio>
                        <Radio value={'name'}>{'Tittel'}</Radio>
                        <Radio value={'datetime'}>{'Sist endret'}</Radio>
                    </RadioGroup>
                </div>
            </div>
        </div>
    );
};
