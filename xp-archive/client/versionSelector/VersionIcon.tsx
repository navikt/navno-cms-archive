import React from 'react';

type VersionIconProps = {
    isOpen: boolean;
};

export const VersionIcon = ({ isOpen }: VersionIconProps) => {
    return (
        <div>
            <svg
                aria-hidden="true"
                focusable="false"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
            >
                <path fill={isOpen ? 'currentColor' : 'none'} d="M4 4h5v16H4z" />
                <path
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9 4v16M4 4h16v16H4z"
                />
            </svg>
        </div>
    );
};
