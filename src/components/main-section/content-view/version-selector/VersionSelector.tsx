import React from 'react';
import { Select } from '@navikt/ds-react';
import { CmsContentDocument } from '../../../../../common/cms-documents/content';
import { useAppState } from '../../../../state/useAppState';
import { useApiFetch } from '../../../../fetch/useApiFetch';

const TITLE_MAX_LENGTH = 100;

type Props = {
    content: CmsContentDocument;
};

export const VersionSelector = ({ content }: Props) => {
    const { setSelectedContent } = useAppState();
    const { fetchContentVersion } = useApiFetch();

    return (
        <Select
            label={'Velg versjon'}
            hideLabel={true}
            defaultValue={content.versionKey}
            size={'small'}
            onChange={(e) => {
                fetchContentVersion(e.target.value).then((res) => {
                    if (res) {
                        setSelectedContent(res);
                    }
                });
            }}
        >
            {content.versions?.map((version) => (
                <option value={version.key} key={version.key}>
                    {`${new Date(version.timestamp || '').toLocaleString('no')} - ${pruneTitle(content.displayName)} [${version.key}]`}
                </option>
            ))}
        </Select>
    );
};

const pruneTitle = (title: string) => {
    if (title.length < TITLE_MAX_LENGTH) {
        return title;
    }

    return `${title.slice(0, TITLE_MAX_LENGTH)} (...)`;
};
