import React, { useEffect, useState } from 'react';
import { CmsCategoryListItem } from '../../../../common/cms-documents/category';
import { Alert, Button, Heading, Pagination, TextField } from '@navikt/ds-react';
import { ArrowLeftIcon } from '@navikt/aksel-icons';
import { useAppState } from '../../../context/app-state/useAppState';
import { ContentLink } from './content-link/ContentLink';
import { useFetchCategoryContents } from '../../../fetch/useFetchCategoryContents';
import { ContentLoader } from '../../common/loader/ContentLoader';
import { CategoriesPath } from '../../common/categories-path/CategoriesPath';

import style from './ContentMenu.module.css';

const CONTENTS_PER_PAGE = 40;
const MAX_CONTENTS = 10000;

type Props = {
    parentCategory: CmsCategoryListItem;
};

export const ContentMenu = ({ parentCategory }: Props) => {
    const { key: parentKey, title: parentTitle, contentCount, path } = parentCategory;

    const [pageNumber, setPageNumber] = useState<number>(1);
    const [query, setQuery] = useState<string>('');

    const { setContentSelectorOpen } = useAppState();
    const { result, isLoading } = useFetchCategoryContents({
        categoryKey: parentCategory.key,
        from: (pageNumber - 1) * CONTENTS_PER_PAGE,
        size: CONTENTS_PER_PAGE,
        query,
    });

    const hits = result?.hits || [];

    const currentCount = result?.total ?? contentCount;
    const numPages = Math.ceil(Math.min(currentCount, MAX_CONTENTS) / CONTENTS_PER_PAGE);

    useEffect(() => {
        setPageNumber(1);
        setQuery('');
    }, [parentKey]);

    return (
        <div className={style.wrapper}>
            <div className={style.topRow}>
                <Button
                    onClick={() => setContentSelectorOpen(false)}
                    variant={'tertiary'}
                    size={'xsmall'}
                    icon={<ArrowLeftIcon />}
                >
                    {'Tilbake'}
                </Button>
                <TextField
                    label={'Søk i denne kategorien'}
                    placeholder={'Søk i denne kategorien'}
                    hideLabel={true}
                    size={'small'}
                    className={style.search}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>
            <CategoriesPath path={path} size={'small'} className={style.path} />
            <Heading level={'2'} size={'xsmall'} className={style.title}>
                {parentTitle}
            </Heading>
            {query && !isLoading && hits.length === 0 && (
                <Alert
                    variant={'info'}
                    className={style.notFound}
                    size={'small'}
                    inline={true}
                >{`Ingen treff for "${query}" i denne kategorien`}</Alert>
            )}
            <div className={style.contentList}>
                {isLoading ? (
                    <ContentLoader
                        size={'xlarge'}
                        text={'Laster innhold...'}
                        direction={'column'}
                    />
                ) : hits ? (
                    <>
                        {hits.map((content) => (
                            <ContentLink content={content} key={content.contentKey} />
                        ))}
                    </>
                ) : (
                    <Alert variant={'error'} inline={true}>
                        {'Feil: Kunne ikke laste innhold for denne kategorien'}
                    </Alert>
                )}
            </div>
            <div className={style.bottomSection}>
                {numPages > 1 && (
                    <>
                        <Pagination
                            page={pageNumber}
                            onPageChange={setPageNumber}
                            count={numPages}
                            size={'xsmall'}
                            className={style.paginator}
                        />
                        {currentCount > MAX_CONTENTS && (
                            <Alert
                                variant={'warning'}
                                size={'small'}
                            >{`Kan ikke vise flere enn ${MAX_CONTENTS} elementer (fant ${currentCount}). Bruk søkefeltet for å redusere antall elementer.`}</Alert>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
