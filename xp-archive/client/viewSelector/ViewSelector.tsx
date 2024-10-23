import { ToggleGroup } from '@navikt/ds-react';

export const ViewSelector = () => {
    return (
        <ToggleGroup onChange={() => {}}>
            <ToggleGroup.Item value="Nettside" label="Nettside"></ToggleGroup.Item>
            <ToggleGroup.Item value="Json" label="Json"></ToggleGroup.Item>
        </ToggleGroup>
    );
};
