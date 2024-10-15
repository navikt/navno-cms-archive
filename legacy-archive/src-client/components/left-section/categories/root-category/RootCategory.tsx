import React from 'react';
import { CmsCategoryListItem } from '../../../../../src-common/cms-documents/category';
import { Category } from '../category/Category';
import { Checkbox } from '@navikt/ds-react';
import { useSearchState } from '../../../../context/search-state/useSearchState';
import { classNames } from '../../../../utils/classNames';

import style from './RootCategory.module.css';

type Props = {
    category: CmsCategoryListItem;
};

export const RootCategory = ({ category }: Props) => {
    const { searchSettingsIsOpen } = useSearchState();

    return (
        <div className={style.rootCategory}>
            <Checkbox
                size={'small'}
                value={category.key}
                className={classNames(style.checkbox, searchSettingsIsOpen && style.open)}
                hideLabel={true}
            >
                {`Inkluder ${category.title} i søket`}
            </Checkbox>
            <Category category={category} />
        </div>
    );
};
