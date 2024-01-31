import React from 'react';
import { CmsCategory } from '../../../../common/cms-documents/category';
import { Button, Heading } from '@navikt/ds-react';
import { ArrowLeftIcon } from '@navikt/aksel-icons';
import { useAppState } from '../../../state/useAppState';
import { ContentLink } from './content-link/ContentLink';
import { useFetchCategoryContents } from '../../../fetch/useFetchCategoryContents';
import { ContentLoader } from '../../common/loader/ContentLoader';

import style from './ContentsMenu.module.css';

type Props = {
    parentCategory: CmsCategory;
};

export const ContentsMenu = ({ parentCategory }: Props) => {
    const { key: parentKey, title: parentTitle } = parentCategory;

    const { setContentSelectorOpen } = useAppState();
    const { contents, isLoading } = useFetchCategoryContents(parentCategory.key);

    return (
        <div className={style.wrapper}>
            <div className={style.header}>
                <Button
                    onClick={() => setContentSelectorOpen(false)}
                    variant={'tertiary'}
                    size={'xsmall'}
                    icon={<ArrowLeftIcon />}
                >
                    {'Tilbake'}
                </Button>
                <Heading level={'2'} size={'xsmall'}>{`${parentTitle} (${parentKey})`}</Heading>
            </div>
            <div className={style.contentList}>
                {isLoading ? (
                    <ContentLoader size={'3xlarge'} text={'Laster innhold...'} />
                ) : (
                    contents?.map((content) => (
                        <ContentLink content={content} key={content.contentKey} />
                    ))
                )}
            </div>
        </div>
    );
};
