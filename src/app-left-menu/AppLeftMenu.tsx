import React from 'react';
import { CmsCategoryDocument } from '../../common/types/cms-documents/category.ts';
import { BodyLong } from '@navikt/ds-react';

type Props = {
    rootCategories: CmsCategoryDocument[];
};

export const AppLeftMenu = ({ rootCategories }: Props) => {
    return rootCategories.map((category) => {
        return <BodyLong key={category.key}>{category.title}</BodyLong>;
    });
};
