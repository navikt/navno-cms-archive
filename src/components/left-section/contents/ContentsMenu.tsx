import React from 'react';
import { CmsCategory } from '../../../../common/cms-documents/category';
import { Button, Heading } from '@navikt/ds-react';
import { ArrowLeftIcon } from '@navikt/aksel-icons';
import { useAppState } from '../../../state/useAppState';

import style from './ContentsMenu.module.css';

type Props = {
    parentCategory: CmsCategory;
};

export const ContentsMenu = ({ parentCategory }: Props) => {
    const { setContentSelectorOpen } = useAppState();

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
                <Heading
                    level={'2'}
                    size={'xsmall'}
                >{`${parentCategory.title} (${parentCategory.key})`}</Heading>
            </div>
        </div>
    );
};
