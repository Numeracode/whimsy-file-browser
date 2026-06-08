/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import React, { ReactElement, useMemo } from 'react';

import { important, makeGlobalChonkyStyles, useChonkyTheme } from '../../util/styles';
import { useFolderChainItems } from './FileNavbar-hooks';
import { FolderChainButton } from './FolderChainButton';
import { SmartToolbarButton } from './ToolbarButton';

export interface FileNavbarProps {}

export const FileNavbar: React.FC<FileNavbarProps> = React.memo(() => {
    const classes = useStyles();
    const theme = useChonkyTheme();
    const folderChainItems = useFolderChainItems();

    const folderChainComponents = useMemo(() => {
        const components: ReactElement[] = [];
        for (let i = 0; i < folderChainItems.length; i++) {
            const key = `folder-chain-${i}`;
            const component = (
                <FolderChainButton
                    key={key}
                    first={i === 0}
                    current={i === folderChainItems.length - 1}
                    item={folderChainItems[i]}
                />
            );
            components.push(component);
        }
        return components;
    }, [folderChainItems]);

    return (
        <div className={classes.navbarWrapper}>
            <div className={classes.navbarContainer}>
                <SmartToolbarButton fileActionId={'open-parent-folder'} />
                <nav className={classes.navbarBreadcrumbs}
                     style={{ fontSize: theme.toolbar.fontSize }}>
                    {folderChainComponents.map((comp, i) => (
                        <React.Fragment key={i}>
                            {i > 0 && (
                                <span className={classes.separator}
                                      style={{ marginRight: 4, marginLeft: 4 }}>
                                    /
                                </span>
                            )}
                            {comp}
                        </React.Fragment>
                    ))}
                </nav>
            </div>
        </div>
    );
});

const useStyles = makeGlobalChonkyStyles(theme => ({
    navbarWrapper: {
        paddingBottom: theme.margins.rootLayoutMargin,
    },
    navbarContainer: {
        display: 'flex',
    },
    navbarBreadcrumbs: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        flexGrow: 100,
    },
    separator: {
        color: theme.palette.text.disabled,
    },
}));
