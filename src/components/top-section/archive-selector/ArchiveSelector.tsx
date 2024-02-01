import React from 'react';
import { Select } from '@navikt/ds-react';
import { useAppState } from '../../../state/useAppState';

export const ArchiveSelector = () => {
    const { appContext } = useAppState();

    return (
        <div>
            <Select
                label={'Velg arkiv'}
                defaultValue={appContext.basePath}
                size={'small'}
                onChange={(e) => window.location.assign(e.target.value)}
            >
                <option value={'/sbs'}>{'Selvbetjeningssonen'}</option>
                <option value={'/fss'}>{'Fagsystemsonen'}</option>
            </Select>
        </div>
    );
};
