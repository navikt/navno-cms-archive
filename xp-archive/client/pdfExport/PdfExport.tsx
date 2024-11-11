import React, { useState } from 'react';
import { DownloadIcon } from '@navikt/aksel-icons';
import { Checkbox, CheckboxGroup, Link } from '@navikt/ds-react';
import { VersionReference } from 'shared/types';
import { formatTimestamp } from '@common/shared/timestamp';

type Props = {
    versions: VersionReference[];
};
const PDF_API = `${import.meta.env.VITE_APP_ORIGIN}/xp/api/pdf`;

export const PdfExport = ({ versions }: Props) => {
    const [versionsSelected, setVersionsSelected] = useState<string[]>([]);

    const handleChange = (selectedVersions: string[]) => {
        setVersionsSelected(selectedVersions);
    };

    return (
        <>
            <CheckboxGroup legend="Versjoner" onChange={handleChange}>
                {versions.map((v) => (
                    <Checkbox key={v.versionId} value={`${v.nodeId};${v.versionId}`}>
                        {v.displayName} {formatTimestamp(v.timestamp)}{' '}
                    </Checkbox>
                ))}
            </CheckboxGroup>

            <Link
                href={`${PDF_API}?contentId=${versions[0].nodeId}&versionIds=${versionsSelected.join(',')}&locale=no`}
                target={'_blank'}
                download={true}
            >
                {'Last ned valgte versjoner '}
                <DownloadIcon title="Last ned versjon(er)" />
            </Link>
        </>
    );
};
