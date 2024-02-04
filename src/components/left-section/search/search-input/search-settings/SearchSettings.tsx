import React, { useState } from 'react';
import { Button, HelpText, Label, Radio, RadioGroup, UNSAFE_Combobox } from '@navikt/ds-react';
import { ChevronDownIcon, XMarkIcon } from '@navikt/aksel-icons';
import { ContentSearchParams } from '../../../../../../common/contentSearch';
import { classNames } from '../../../../../utils/classNames';
import { useAppState } from '../../../../../state/useAppState';
import { CmsCategoryListItem } from '../../../../../../common/cms-documents/category';
import { persistSearchParams } from '../params-initial-state';

import style from './SearchSettings.module.css';

type Props = {
    searchParams: ContentSearchParams;
    setSearchParams: (params: ContentSearchParams) => void;
    reset: () => void;
};

export const SearchSettings = ({ searchParams, setSearchParams, reset }: Props) => {
    const [isOpen, setIsOpen] = useState(false);

    const { appContext } = useAppState();
    const { rootCategories, basePath } = appContext;

    const { sort, categoryKeys, type, isCustom } = searchParams;

    const { titlesToKeys, keysToTitles } = createKeysTitlesMaps(rootCategories);
    const categoryKeysSelected = new Set<string>(categoryKeys);
    const categoryTitlesSelected = [...categoryKeysSelected].map((key) => keysToTitles[key]);
    const categoryTitlesAll = Object.keys(titlesToKeys);

    const updateSearchParams = (params: Partial<ContentSearchParams>) => {
        const newParams: ContentSearchParams = { ...searchParams, ...params, isCustom: true };
        persistSearchParams(newParams, basePath);
        setSearchParams(newParams);
    };

    return (
        <div className={style.container}>
            <div className={style.topRow}>
                <Label size={'small'}>{'Søk'}</Label>
                <div>
                    {isCustom && (
                        <Button
                            size={'xsmall'}
                            variant={'tertiary'}
                            className={style.toggle}
                            onClick={reset}
                        >
                            {'Nullstill'}
                            <XMarkIcon />
                        </Button>
                    )}
                    <Button
                        size={'xsmall'}
                        variant={'tertiary'}
                        className={style.toggle}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {'Tilpass søket'}
                        <ChevronDownIcon className={classNames(style.icon, isOpen && style.open)} />
                    </Button>
                </div>
            </div>
            <div className={classNames(style.settings, isOpen && style.open)}>
                <div className={style.radioGroups}>
                    <RadioGroup
                        size={'small'}
                        legend={'Søk etter...'}
                        value={type || 'titles'}
                        onChange={(value) => updateSearchParams({ type: value })}
                    >
                        <Radio value={'titles'}>{'Tittel'}</Radio>
                        <span className={style.withHelp}>
                            <Radio value={'locations'}>{'URL'}</Radio>
                            <HelpText wrapperClassName={style.help}>
                                {'Prefix-søk på pathname. F.eks. vil '}
                                <code>{'https://www.nav.no/no/person/arbeid'}</code>
                                {' gi treff på alle sider med en path som starter med '}
                                <code>{'/no/person/arbeid'}</code>
                            </HelpText>
                        </span>
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
                <UNSAFE_Combobox
                    label={'Avgrens til valgte kategorier'}
                    size={'small'}
                    className={style.categoriesSelector}
                    clearButton={true}
                    isMultiSelect={true}
                    allowNewValues={false}
                    options={categoryTitlesAll}
                    selectedOptions={categoryTitlesSelected}
                    onToggleSelected={(value, isSelected) => {
                        const key = titlesToKeys[value];
                        if (isSelected) {
                            categoryKeysSelected.add(key);
                        } else {
                            categoryKeysSelected.delete(key);
                        }

                        updateSearchParams({ categoryKeys: [...categoryKeysSelected] });
                    }}
                />
            </div>
        </div>
    );
};

const createKeysTitlesMaps = (categories: CmsCategoryListItem[]) => {
    return categories.reduce<{
        keysToTitles: Record<string, string>;
        titlesToKeys: Record<string, string>;
    }>(
        (acc, category) => {
            acc.titlesToKeys[category.title] = category.key;
            acc.keysToTitles[category.key] = category.title;
            return acc;
        },
        { keysToTitles: {}, titlesToKeys: {} }
    );
};
