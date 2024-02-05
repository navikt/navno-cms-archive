import React from 'react';
import { CategoriesMenu } from './categories/CategoriesMenu';
import { ContentMenu } from './contents/ContentMenu';
import { classNames } from '../../utils/classNames';
import { SearchInput } from './search/search-input/SearchInput';
import { SearchResult } from './search/search-result/SearchResult';
import { Alert, BodyLong, Heading } from '@navikt/ds-react';
import { useAppState } from '../../context/app-state/useAppState';
import { useSearchState } from '../../context/search-state/useSearchState';

import style from './AppLeftSection.module.css';

export const AppLeftSection = () => {
    const { selectedCategory, appContext, contentSelectorOpen } = useAppState();
    const { rootCategories } = appContext;

    const { searchResultIsOpen } = useSearchState();

    return (
        <div className={style.root}>
            <div
                className={classNames(
                    style.categoriesAndSearch,
                    contentSelectorOpen && style.hidden
                )}
            >
                {rootCategories.length === 0 ? (
                    <Alert variant={'error'}>
                        <Heading size={'xsmall'} level={'2'}>
                            {'Noe gikk galt!'}
                        </Heading>
                        <BodyLong size={'small'}>
                            {
                                'Kunne ikke laste innhold fra arkivet. Prøv igjen (F5), eller kontakt brukerstøtte dersom problemet vedvarer.'
                            }
                        </BodyLong>
                    </Alert>
                ) : (
                    <SearchInput />
                )}
                <div className={style.categoriesAndSearchResult}>
                    <div
                        className={classNames(
                            style.categoriesMenu,
                            searchResultIsOpen && style.hidden
                        )}
                    >
                        <CategoriesMenu rootCategories={rootCategories} />
                    </div>
                    <div
                        className={classNames(style.searchResult, searchResultIsOpen && style.open)}
                    >
                        <SearchResult />
                    </div>
                </div>
            </div>
            <div className={classNames(style.contentMenu, contentSelectorOpen && style.open)}>
                {selectedCategory && <ContentMenu parentCategory={selectedCategory} />}
            </div>
        </div>
    );
};
