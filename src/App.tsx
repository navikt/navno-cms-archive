import React from 'react';
import dsreact from '@navikt/ds-react';

const { HGrid } = dsreact;

type Props = {
    context: any
}

export const App = ({ context }: Props) => {
    console.log('Context:', context);

    return (
        <div>
            <HGrid columns={{ md: '240px minmax(auto, 700px)' }} gap={'4'}>
                <div>{'Hello world!'}</div>
                <div>{'Hello worlderino!'}</div>
            </HGrid>
        </div>
    );
};
