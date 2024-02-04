import React, { useState } from 'react';
import { Button, HelpText, Label, Radio, RadioGroup, UNSAFE_Combobox } from '@navikt/ds-react';
import { ChevronDownIcon } from '@navikt/aksel-icons';
import { ContentSearchParams } from '../../../../../common/contentSearch';
import { classNames } from '../../../../utils/classNames';
import { useAppState } from '../../../../state/useAppState';
import { CmsCategoryListItem } from '../../../../../common/cms-documents/category';

import style from './SearchSettings.module.css';

type Props = {
    searchParams: ContentSearchParams;
    setSearchParams: (params: Partial<ContentSearchParams>) => void;
};

export const SearchSettings = ({ searchParams, setSearchParams }: Props) => {
    const [isOpen, setIsOpen] = useState(false);

    const { appContext } = useAppState();

    const { sort, categoryKeys, type } = searchParams;

    const { titlesToKeys, keysToTitles } = createKeysTitlesMaps(appContext.rootCategories);
    const categoryKeysSelected = new Set<string>(categoryKeys);
    const categoryTitlesSelected = [...categoryKeysSelected].map((key) => keysToTitles[key]);
    const categoryTitlesAll = Object.keys(titlesToKeys);

    return (
        <div className={style.container}>
            <div className={style.labels}>
                <Label size={'small'}>{'Søk'}</Label>
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
            <div className={classNames(style.settings, isOpen && style.open)}>
                <RadioGroup
                    size={'small'}
                    legend={'Søk etter...'}
                    value={type}
                    onChange={(value) => setSearchParams({ type: value })}
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
                    value={sort}
                    onChange={(value) => setSearchParams({ sort: value })}
                >
                    <Radio value={'score'}>{'Beste treff'}</Radio>
                    <Radio value={'name'}>{'Tittel'}</Radio>
                    <Radio value={'datetime'}>{'Sist endret'}</Radio>
                </RadioGroup>
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

                        setSearchParams({ categoryKeys: [...categoryKeysSelected] });
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
