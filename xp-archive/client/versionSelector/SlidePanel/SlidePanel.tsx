import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import style from './SlidePanel.module.css';

type SlidePanelProps = {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

export const SlidePanel = ({ isOpen, onClose, children }: SlidePanelProps) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            dialog.showModal();
        } else {
            dialog.close();
        }
    }, [isOpen]);

    if (!isOpen) return null;

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
            <div className={style.panel}>{children}</div>
        </dialog>,
        document.body
    );
};
