import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import style from './SlidePanel.module.css';

type SlidePanelProps = {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

export const SlidePanel = ({ isOpen, onClose, children }: SlidePanelProps) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    // Keep a local copy of children to prevent unmounting
    const [cachedChildren, setCachedChildren] = useState<React.ReactNode>(children);

    // Update cached children only when isOpen changes from false to true
    useEffect(() => {
        if (isOpen) {
            setCachedChildren(children);
        }
    }, [isOpen, children]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            dialog.showModal();
        } else {
            dialog.close();
        }
    }, [isOpen]);

    // Always render the dialog, but control its visibility with the dialog API
    return createPortal(
        <dialog
            ref={dialogRef}
            className={style.overlay}
            onClose={onClose}
            aria-modal="true"
            aria-label="Version selector"
        >
            <button
                className={style.backdrop}
                onClick={onClose}
                aria-label="Close version selector"
            />
            <div className={style.panel}>
                {/* Always use the cached children */}
                {cachedChildren}
            </div>
        </dialog>,
        document.body
    );
};
