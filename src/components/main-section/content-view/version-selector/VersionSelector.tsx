import React, { useState } from 'react';
import { Select } from '@navikt/ds-react';
import { CmsContent } from '../../../../../common/cms-documents/content';
import { useApiFetch } from '../../../../fetch/useApiFetch';
import { useAppState } from '../../../../context/app-state/useAppState';

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

                fetchContentVersion(versionKey).then((res) => {
                    if (res) {
                        setSelectedContent(res);
                        setError(null);
                    } else {
                        setError(`Lasting av versjon med nøkkel "${versionKey}" feilet!`);
                    }
                });
            }}
        >
            {content.versions.map((version) => {
                const dateTime = new Date(version.timestamp).toLocaleString('no');
                return (
                    <option value={version.key} key={version.key}>
                        {`[${dateTime}] - ${pruneTitle(version.title)}`}
                    </option>
                );
            })}
        </Select>
    );
};

const pruneTitle = (title: string) => {
    if (title.length < TITLE_MAX_LENGTH) {
        return title;
    }

    return `${title.slice(0, TITLE_MAX_LENGTH)} (...)`;
};
