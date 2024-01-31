import React, { useEffect, useState } from 'react';
import { CmsCategory } from '../../../../common/cms-documents/category';
import { Button, Heading, Link } from '@navikt/ds-react';
import { ArrowLeftIcon } from '@navikt/aksel-icons';
import { useAppState } from '../../../state/useAppState';
import { useApiFetch } from '../../../state/useApiFetch';
import { CmsContentDocument } from '../../../../common/cms-documents/content';

import style from './ContentsMenu.module.css';

type Props = {
    parentCategory: CmsCategory;
};

export const ContentsMenu = ({ parentCategory }: Props) => {
    const { setContentSelectorOpen, setSelectedContent } = useAppState();
    const { fetchCategoryContents, fetchContent } = useApiFetch();

    const { key: parentKey, title: parentTitle } = parentCategory;

    const [contents, setContents] = useState<CmsContentDocument[] | null>(null);

    useEffect(() => {
        fetchCategoryContents(parentKey).then(setContents);
    }, [fetchCategoryContents, parentKey]);

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
            <div>
                {contents?.map((content) => (
                    <Link
                        key={content.contentKey}
                        href={''}
                        onClick={(e) => {
                            e.preventDefault();
                            fetchContent(content.contentKey).then((res) => {
                                if (res) {
                                    setSelectedContent(res);
                                }
                            });
                        }}
                    >
                        {content.displayName}
                    </Link>
                ))}
            </div>
        </div>
    );
};
