import React from 'react';
import { Alert } from '@navikt/ds-react';

type Props = {
    context: any
}

export const App = ({ context }: Props) => {
    console.log('Context:', context);

    return (
        <div>
            <Alert variant={"success"}>{"Great success!"}</Alert>
        </div>
    );
};
