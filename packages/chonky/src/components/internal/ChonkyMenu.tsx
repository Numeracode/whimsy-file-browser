/**
 * Lightweight dropdown menu component (replaces MUI Menu).
 */
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { makeGlobalChonkyStyles } from '../../util/styles';

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
    const classes = useStyles();

    const getDesiredCoords = useCallback(() => {
        if (anchorPosition) return anchorPosition;
        if (anchorEl) {
            const rect = anchorEl.getBoundingClientRect();
            return { top: rect.bottom, left: rect.left };
        }
        return { top: 0, left: 0 };
    }, [anchorEl, anchorPosition]);

    const clampCoords = useCallback((desired: { top: number; left: number }) => {
        if (typeof window === 'undefined') return desired;

        const menu = menuRef.current;
        const menuWidth = menu?.offsetWidth ?? 160;
        const menuHeight = menu?.offsetHeight ?? 0;
        const maxTop = Math.max(0, window.innerHeight - menuHeight);
        const maxLeft = Math.max(0, window.innerWidth - menuWidth);

        return {
            top: Math.max(0, Math.min(desired.top, maxTop)),
            left: Math.max(0, Math.min(desired.left, maxLeft)),
        };
    }, []);

    const updatePosition = useCallback(() => {
        setCoords(clampCoords(getDesiredCoords()));
    }, [clampCoords, getDesiredCoords]);

    useLayoutEffect(() => {
        if (!open) return;
        updatePosition();
    }, [open, updatePosition]);

    useEffect(() => {
        if (!open || typeof window === 'undefined') return;
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [open, updatePosition]);

    // Click outside handler
    useEffect(() => {
        if (!open) return;
        const handleClick = (e: MouseEvent) => {
            if (
                menuRef.current &&
                e.target instanceof Node &&
                !menuRef.current.contains(e.target)
            ) {
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
            data-chonky-menu-root=""
            className={classes.menu}
            style={{
                position: 'fixed',
                top: coords.top,
                left: coords.left,
                minWidth: 'var(--chonky-menu-min-width, 160px)',
            }}
        >
            {children}
        </div>,
        document.body
    );
};

const useStyles = makeGlobalChonkyStyles(theme => ({
    menu: {
        zIndex: 'var(--chonky-menu-z, 1300)',
        backgroundColor: `var(--chonky-menu-bg, ${theme.palette.background.paper})`,
        color: `var(--chonky-menu-color, ${theme.palette.text.primary})`,
        borderRadius: 'var(--chonky-menu-radius, 4px)',
        boxShadow: 'var(--chonky-menu-shadow, 0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12))',
        outline: 0,
        padding: 'var(--chonky-menu-padding, 4px 0)',
    },
}));
