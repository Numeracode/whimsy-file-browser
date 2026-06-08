/**
 * Lightweight dropdown menu component (replaces MUI Menu).
 */
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface ChonkyMenuProps {
    open: boolean;
    onClose: () => void;
    anchorEl?: HTMLElement | null;
    anchorPosition?: { top: number; left: number };
    children: React.ReactNode;
}

export const ChonkyMenu: React.FC<ChonkyMenuProps> = ({
    open,
    onClose,
    anchorEl,
    anchorPosition,
    children,
}) => {
    const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;

        if (anchorPosition) {
            setCoords(anchorPosition);
        } else if (anchorEl) {
            const rect = anchorEl.getBoundingClientRect();
            setCoords({ top: rect.bottom, left: rect.left });
        }
    }, [open, anchorEl, anchorPosition]);

    // Click outside handler
    useEffect(() => {
        if (!open) return;
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        // Delay to avoid immediate close from the same click that opened
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClick);
        }, 0);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClick);
        };
    }, [open, onClose]);

    // Escape key handler
    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div
            ref={menuRef}
            style={{
                position: 'fixed',
                top: coords.top,
                left: coords.left,
                zIndex: 1300,
                backgroundColor: '#fff',
                borderRadius: 4,
                boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)',
                minWidth: 120,
                outline: 0,
                padding: '4px 0',
            }}
        >
            {children}
        </div>,
        document.body
    );
};
