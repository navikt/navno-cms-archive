import React from 'react';
import { CmsCategoryListItem } from '../../../../common/cms-documents/category';
import { Alert, Button, Heading, Tooltip } from '@navikt/ds-react';
import { ArrowLeftIcon } from '@navikt/aksel-icons';
import { useAppState } from '../../../state/useAppState';
import { ContentLink } from './content-link/ContentLink';
import { useFetchCategoryContents } from '../../../fetch/useFetchCategoryContents';
import { ContentLoader } from '../../common/loader/ContentLoader';

import style from './ContentsMenu.module.css';

const CONTENTS_PER_PAGE = 40;

type Props = {
    parentCategory: CmsCategoryListItem;
};

export const ContentsMenu = ({ parentCategory }: Props) => {
    const { key: parentKey, title: parentTitle } = parentCategory;

    const { setContentSelectorOpen } = useAppState();
    const { contents, isLoading } = useFetchCategoryContents(
        parentCategory.key,
        0,
        CONTENTS_PER_PAGE
    );

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
                        size={'3xlarge'}
                        text={'Laster innhold...'}
                        direction={'column'}
                    />
                ) : contents ? (
                    contents.map((content) => (
                        <ContentLink content={content} key={content.contentKey} />
                    ))
                ) : (
                    <Alert variant={'error'} inline={true}>
                        {'Feil: Kunne ikke laste innhold for denne kategorien'}
                    </Alert>
                )}
            </div>
        </div>
    );
};
