import React from 'react';
import { CmsContentDocument } from '../../../../common/cms-documents/content.ts';
import { Select } from '@navikt/ds-react';

type Props = {
    content: CmsContentDocument;
};

export const VersionSelector = ({ content }: Props) => {
    const { versions } = content;

    if (!versions) {
        return null;
    }

    return (
        <Select label={'Velg versjon'}>
            {' '}
            {versions.map((version) => (
                <option value={version.key} key={version.key}>
                    {version.title}
                </option>
            ))}
        </Select>
    );
};
