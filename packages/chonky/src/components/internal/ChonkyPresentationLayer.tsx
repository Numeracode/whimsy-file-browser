/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { reduxActions } from '../../redux/reducers';
import {
    selectClearSelectionOnOutsideClick,
    selectFileActionIds,
    selectIsDnDDisabled,
} from '../../redux/selectors';
import { useDndContextAvailable } from '../../util/dnd-fallback';
import { elementIsInsideButton } from '../../util/helpers';
import { makeGlobalChonkyStyles, useChonkyTheme } from '../../util/styles';
import { useContextMenuTrigger } from '../external/FileContextMenu-hooks';
import { DnDFileListDragLayer } from '../file-list/DnDFileListDragLayer';
import { HotkeyListener } from './HotkeyListener';

export interface ChonkyPresentationLayerProps {}

export const ChonkyPresentationLayer: React.FC<ChonkyPresentationLayerProps> = ({
    children,
}) => {
    const dispatch = useDispatch();
    const fileActionIds = useSelector(selectFileActionIds);
    const dndDisabled = useSelector(selectIsDnDDisabled);
    const clearSelectionOnOutsideClick = useSelector(
        selectClearSelectionOnOutsideClick
    );

    // Deal with clicks outside of Chonky
    const handleClickAway = useCallback(
        (event: React.MouseEvent<Document>) => {
            if (!clearSelectionOnOutsideClick || elementIsInsideButton(event.target)) {
                return;
            }
            dispatch(reduxActions.clearSelection());
        },
        [dispatch, clearSelectionOnOutsideClick]
    );

    // Generate necessary components
    const hotkeyListenerComponents = useMemo(
        () =>
            fileActionIds.map(actionId => (
                <HotkeyListener
                    key={`file-action-listener-${actionId}`}
                    fileActionId={actionId}
                />
            )),
        [fileActionIds]
    );

    const dndContextAvailable = useDndContextAvailable();
    const showContextMenu = useContextMenuTrigger();

    const classes = useStyles();
    const theme = useChonkyTheme();
    const rootStyle: React.CSSProperties = {
        backgroundColor: theme.palette.background.paper,
        border: `solid 1px ${theme.palette.divider}`,
        padding: theme.margins.rootLayoutMargin,
        fontSize: theme.fontSizes.rootPrimary,
        color: theme.palette.text.primary,
    };

    return (
        <div
            className={classes.chonkyRoot}
            style={rootStyle}
            onContextMenu={showContextMenu}
            onClick={handleClickAway as any}
        >
            {!dndDisabled && dndContextAvailable && <DnDFileListDragLayer />}
            {hotkeyListenerComponents}
            {children ? children : null}
        </div>
    );
};

const useStyles = makeGlobalChonkyStyles(() => ({
    chonkyRoot: {
        touchAction: 'manipulation',
        fontFamily: 'sans-serif',
        flexDirection: 'column',
        boxSizing: 'border-box',
        textAlign: 'left',
        borderRadius: 4,
        display: 'flex',
        height: '100%',

        // Disabling select
        webkitTouchCallout: 'none',
        webkitUserSelect: 'none',
        mozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
    },
}));
