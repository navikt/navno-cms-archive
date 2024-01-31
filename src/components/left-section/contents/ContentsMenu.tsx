import React from 'react';
import { CmsCategoryDocument } from '../../../../common/cms-documents/category';
import { Button, Heading } from '@navikt/ds-react';

import style from './ContentsMenu.module.css';
import { ArrowLeftIcon } from '@navikt/aksel-icons';

type Props = {
    parentCategory: CmsCategoryDocument;
    close: () => void;
};

export const ContentsMenu = ({ parentCategory, close }: Props) => {
    return (
        <div className={style.wrapper}>
            <div className={style.header}>
                <Button
                    onClick={close}
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
