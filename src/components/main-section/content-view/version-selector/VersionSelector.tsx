import React from 'react';
import { Select } from '@navikt/ds-react';
import { fetchContentVersion } from '../../../../utils/fetch/fetchContent.ts';
import { CmsContentDocument } from '../../../../../common/cms-documents/content.ts';
import { useAppState } from '../../../../state/useAppState.tsx';

type Props = {
    content: CmsContentDocument;
};

export const VersionSelector = ({ content }: Props) => {
    const { appContext, setSelectedContent } = useAppState();

    return (
        <Select
            label={'Velg versjon'}
            defaultValue={content.versionKey}
            onChange={(e) => {
                fetchContentVersion(appContext.basePath)(e.target.value).then(
                    (res) => {
                        if (res) {
                            setSelectedContent(res);
                        }
                    }
                );
            }}
        >
            {content.versions?.map((version) => (
                <option value={version.key} key={version.key}>
                    {`${new Date(version.timestamp || '').toLocaleString('no')} - ${version.title} [${version.key}]`}
                </option>
            ))}
        </Select>
    );
};
