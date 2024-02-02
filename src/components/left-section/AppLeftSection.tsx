import React, { useEffect, useState } from 'react';
import { CategoriesMenu } from './categories/CategoriesMenu';
import { ContentMenu } from './contents/ContentMenu';
import { useAppState } from '../../state/useAppState';
import { classNames } from '../../utils/classNames';
import { SearchInput } from './search/SearchInput';
import { SearchResult } from './search/search-result/SearchResult';
import { ContentSearchResult } from '../../../common/contentSearchResult';
import { Alert, BodyLong, Heading } from '@navikt/ds-react';

import style from './AppLeftSection.module.css';

export const AppLeftSection = () => {
    const [searchResult, setSearchResult] = useState<ContentSearchResult | null>(null);
    const [searchResultOpen, setSearchResultOpen] = useState(false);

    const { selectedCategory, appContext, contentSelectorOpen } = useAppState();
    const { rootCategories } = appContext;

    useEffect(() => {
        setSearchResultOpen(!!searchResult);
    }, [searchResult]);

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
                    <SearchInput setSearchResult={setSearchResult} />
                )}
                <div className={style.categoriesAndSearchResult}>
                    <div
                        className={classNames(
                            style.categoriesMenu,
                            searchResultOpen && style.hidden
                        )}
                    >
                        <CategoriesMenu rootCategories={rootCategories} />
                    </div>
                    <div className={classNames(style.searchResult, searchResultOpen && style.open)}>
                        <SearchResult
                            result={searchResult}
                            close={() => setSearchResultOpen(false)}
                        />
                    </div>
                </div>
            </div>
            <div className={classNames(style.contentMenu, contentSelectorOpen && style.open)}>
                {selectedCategory && <ContentMenu parentCategory={selectedCategory} />}
            </div>
        </div>
    );
};
