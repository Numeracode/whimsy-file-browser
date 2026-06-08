/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import React, { useCallback, useMemo } from 'react';

import { FileActionGroup } from '../../types/action-menus.types';
import { useLocalizedFileActionGroup } from '../../util/i18n';
import { makeGlobalChonkyStyles } from '../../util/styles';
import { ChonkyMenu } from '../internal/ChonkyMenu';
import { ToolbarButton } from './ToolbarButton';
import { SmartToolbarDropdownButton } from './ToolbarDropdownButton';

export type ToolbarDropdownProps = FileActionGroup;

export const ToolbarDropdown: React.FC<ToolbarDropdownProps> = React.memo(props => {
    const { name, fileActionIds } = props;
    const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);

    const handleClick = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => setAnchor(event.currentTarget),
        [setAnchor]
    );
    const handleClose = useCallback(() => setAnchor(null), [setAnchor]);

    const menuItemComponents = useMemo(
        () =>
            fileActionIds.map(id => (
                <SmartToolbarDropdownButton
                    key={`menu-item-${id}`}
                    fileActionId={id}
                    onClickFollowUp={handleClose}
                />
            )),
        [fileActionIds, handleClose]
    );

    const localizedName = useLocalizedFileActionGroup(name);
    const classes = useStyles();
    return (
        <>
            <ToolbarButton text={localizedName} onClick={handleClick} dropdown={true} />
            <ChonkyMenu
                anchorEl={anchor}
                onClose={handleClose}
                open={Boolean(anchor)}
            >
                <div className={classes.dropdownList}>
                    {menuItemComponents}
                </div>
            </ChonkyMenu>
        </>
    );
});

const useStyles = makeGlobalChonkyStyles(() => ({
    dropdownList: {
        paddingBottom: 0,
        paddingTop: 0,
    },
}));
