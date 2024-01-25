import React from 'react';

type Props = {
    something?: string;
};

export const AppMainContent = ({ something }: Props) => {
    return <div>{'Hello world!'}</div>;
};
