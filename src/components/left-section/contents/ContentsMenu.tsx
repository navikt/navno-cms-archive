import React, { useEffect, useState } from 'react';
import { CmsCategoryListItem } from '../../../../common/cms-documents/category';
import { Alert, Button, Heading, Pagination, Tooltip } from '@navikt/ds-react';
import { ArrowLeftIcon } from '@navikt/aksel-icons';
import { useAppState } from '../../../state/useAppState';
import { ContentLink } from './content-link/ContentLink';
import { useFetchCategoryContents } from '../../../fetch/useFetchCategoryContents';
import { ContentLoader } from '../../common/loader/ContentLoader';

import style from './ContentsMenu.module.css';

const CONTENTS_PER_PAGE = 40;
const MAX_CONTENTS = 10000;

type Props = {
    parentCategory: CmsCategoryListItem;
};

export const ContentsMenu = ({ parentCategory }: Props) => {
    const { key: parentKey, title: parentTitle, contentCount } = parentCategory;

    const [pageNumber, setPageNumber] = useState<number>(1);

    const { setContentSelectorOpen } = useAppState();
    const { contents, isLoading } = useFetchCategoryContents(
        parentCategory.key,
        (pageNumber - 1) * CONTENTS_PER_PAGE,
        CONTENTS_PER_PAGE
    );

    const numPages = Math.ceil(Math.min(contentCount, MAX_CONTENTS) / CONTENTS_PER_PAGE);

    useEffect(() => {
        setPageNumber(1);
    }, [parentKey]);

    return (
        <div className={style.wrapper}>
            <Button
                onClick={() => setContentSelectorOpen(false)}
                variant={'tertiary'}
                size={'xsmall'}
                icon={<ArrowLeftIcon />}
            >
                {'Tilbake'}
            </Button>
            <Tooltip content={`Kategori-nøkkel: ${parentKey}`} placement={'left'} delay={1000}>
                <Heading level={'2'} size={'xsmall'} className={style.header}>
                    {parentTitle}
                </Heading>
            </Tooltip>
            <div className={style.contentList}>
                {isLoading ? (
                    <ContentLoader
                        size={'xlarge'}
                        text={'Laster innhold...'}
                        direction={'column'}
                    />
                ) : contents ? (
                    <>
                        {contents.map((content) => (
                            <ContentLink content={content} key={content.contentKey} />
                        ))}
                    </>
                ) : (
                    <Alert variant={'error'} inline={true}>
                        {'Feil: Kunne ikke laste innhold for denne kategorien'}
                    </Alert>
                )}
            </div>
            {numPages > 1 && (
                <>
                    <Pagination
                        page={pageNumber}
                        onPageChange={setPageNumber}
                        count={numPages}
                        size={'xsmall'}
                        className={style.paginator}
                    />
                    {contentCount > MAX_CONTENTS && (
                        <Alert
                            variant={'warning'}
                            size={'small'}
                        >{`Kan ikke vise flere enn ${MAX_CONTENTS} innholdselementer (fant ${contentCount}). Bruk søkefeltet for å filtrer antall treff.`}</Alert>
                    )}
                </>
            )}
        </div>
    );
};
