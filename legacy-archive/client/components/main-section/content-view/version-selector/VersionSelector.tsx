import React, { useState } from 'react';
import { Select } from '@navikt/ds-react';
import { CmsContent } from '../../../../../shared/cms-documents/content';
import { useApiFetch } from '../../../../fetch/useApiFetch';
import { useAppState } from '../../../../context/app-state/useAppState';
import { formatTimestamp } from '@common/shared/timestamp';
import { pruneString } from '@common/shared/pruneString';

const TITLE_MAX_LENGTH = 100;

type Props = {
    content: CmsContent;
};

export const VersionSelector = ({ content }: Props) => {
    const { setSelectedContent } = useAppState();
    const { fetchContentVersion } = useApiFetch();
    const [error, setError] = useState<string | null>(null);

    return (
        <Select
            label={'Versjoner'}
            defaultValue={content.versionKey}
            size={'small'}
            error={error}
            onChange={(e) => {
                const versionKey = e.target.value;

                fetchContentVersion(versionKey)
                    .then((res) => {
                        if (res) {
                            setSelectedContent(res);
                            setError(null);
                        } else {
                            setError(`Lasting av versjon med nøkkel "${versionKey}" feilet!`);
                        }
                    })
                    .catch(() => {});
            }}
        >
            {content.versions.map((version) => {
                const dateTime = formatTimestamp(version.timestamp);
                return (
                    <option value={version.key} key={version.key}>
                        {`${pruneString(version.title, TITLE_MAX_LENGTH)} - [${dateTime}]`}
                    </option>
                );
            })}
        </Select>
    );
};
