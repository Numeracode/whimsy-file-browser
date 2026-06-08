import React, { CSSProperties, KeyboardEvent, MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';

import type {
    BrowserAction,
    BrowserFolderChainItem,
    BrowserItem,
    BrowserOpaqueId,
    BrowserSelection,
} from '../../types/browser-item.types';
import type {
    BrowserShellActionEvent,
    BrowserShellContextMenuRenderProps,
    BrowserShellNavigateEvent,
    BrowserShellProps,
    BrowserShellToolbarRenderProps,
    BrowserSortState,
    BrowserViewMode,
} from '../../types/browser-shell.types';

const DEFAULT_SORT: BrowserSortState = { key: 'name', direction: 'asc' };

interface ContextMenuState {
    item: BrowserItem;
    x: number;
    y: number;
}

const isDisabled = (item: BrowserItem): boolean => item.flags?.disabled === true;
const canOpen = (item: BrowserItem): boolean => !isDisabled(item) && item.capabilities?.open !== false;
const canSelect = (item: BrowserItem): boolean => !isDisabled(item) && item.capabilities?.select !== false;
const canPreview = (item: BrowserItem): boolean => !isDisabled(item) && item.kind === 'file' && item.capabilities?.preview === true;

const browserItemToFolder = (item: BrowserItem): BrowserFolderChainItem => ({
    id: item.id,
    name: item.name,
    ref: item.ref,
    source: item.source,
    flags: item.flags
        ? {
              disabled: item.flags.disabled,
              disabledReason: item.flags.disabledReason,
          }
        : undefined,
});

const getAvailableThumbnail = (item: BrowserItem): string | null => {
    const thumbnail = item.preview?.thumbnail;
    return thumbnail?.status === 'available' ? thumbnail.url : null;
};

const compareOptionalNumber = (left?: number, right?: number) => (left ?? -1) - (right ?? -1);
const compareOptionalDate = (left?: string, right?: string) =>
    new Date(left ?? 0).getTime() - new Date(right ?? 0).getTime();

const sortItems = (items: readonly BrowserItem[], sort: BrowserSortState): readonly BrowserItem[] => {
    const sorted = [...items];
    sorted.sort((left, right) => {
        let result = 0;
        if (sort.key === 'kind') {
            result = left.kind.localeCompare(right.kind) || left.name.localeCompare(right.name);
        } else if (sort.key === 'sizeBytes') {
            result = compareOptionalNumber(left.sizeBytes, right.sizeBytes) || left.name.localeCompare(right.name);
        } else if (sort.key === 'modifiedAt') {
            result = compareOptionalDate(left.modifiedAt, right.modifiedAt) || left.name.localeCompare(right.name);
        } else {
            result = left.name.localeCompare(right.name);
        }

        return sort.direction === 'asc' ? result : -result;
    });
    return sorted;
};

const formatSize = (sizeBytes?: number): string => {
    if (typeof sizeBytes !== 'number') return '';
    if (sizeBytes < 1024) return `${sizeBytes} B`;
    const units = ['KB', 'MB', 'GB', 'TB'];
    let value = sizeBytes / 1024;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }
    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
};

const makeSelection = (
    selectedIds: readonly BrowserOpaqueId[],
    focusedId?: BrowserOpaqueId,
    anchorId?: BrowserOpaqueId
): BrowserSelection => ({
    selectedIds,
    focusedId,
    anchorId,
});

const isActionForPlacement = (action: BrowserAction, placement: 'toolbar' | 'context-menu'): boolean =>
    !action.placement || action.placement.includes(placement);

const isActionEnabled = (action: BrowserAction, selectedCount: number): boolean => {
    if (action.disabled) return false;
    if (action.selectionScope === 'none') return selectedCount === 0;
    if (action.selectionScope === 'single') return selectedCount === 1;
    if (action.selectionScope === 'multiple') return selectedCount > 1;
    return true;
};

const createActionEvent = (
    action: BrowserAction,
    selection: BrowserSelection,
    items: readonly BrowserItem[],
    item?: BrowserItem
): BrowserShellActionEvent => {
    const selectedIdSet = new Set(selection.selectedIds);
    return {
        action,
        actionId: action.id,
        item,
        selectedItems: items.filter((candidate) => selectedIdSet.has(candidate.id)),
        selection,
    };
};

export const BrowserShell: React.FC<BrowserShellProps> = React.memo((props) => {
    const {
        actions = [],
        className,
        defaultSelection,
        defaultSort = DEFAULT_SORT,
        defaultViewMode = 'list',
        emptyState,
        folderChain = [],
        items,
        onAction,
        onNavigateFolder,
        onOpen,
        onPreview,
        onSelectionChange,
        onSortChange,
        onViewModeChange,
        renderContextMenu,
        renderThumbnail,
        renderToolbar,
        selection,
        sort,
        viewMode,
    } = props;

    const [internalViewMode, setInternalViewMode] = useState<BrowserViewMode>(defaultViewMode);
    const [internalSort, setInternalSort] = useState<BrowserSortState>(defaultSort);
    const [internalSelection, setInternalSelection] = useState<BrowserSelection>(
        defaultSelection ?? makeSelection([])
    );
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

    const currentViewMode = viewMode ?? internalViewMode;
    const currentSort = sort ?? internalSort;
    const currentSelection = selection ?? internalSelection;
    const visibleItems = useMemo(() => sortItems(items.filter((item) => !item.flags?.hidden), currentSort), [items, currentSort]);
    const selectedIdSet = useMemo(() => new Set(currentSelection.selectedIds), [currentSelection.selectedIds]);
    const selectedItems = useMemo(
        () => visibleItems.filter((item) => selectedIdSet.has(item.id)),
        [selectedIdSet, visibleItems]
    );
    const focusedIndex = useMemo(
        () => visibleItems.findIndex((item) => item.id === currentSelection.focusedId),
        [currentSelection.focusedId, visibleItems]
    );

    const applyViewMode = useCallback(
        (nextViewMode: BrowserViewMode) => {
            if (viewMode === undefined) setInternalViewMode(nextViewMode);
            onViewModeChange?.(nextViewMode);
        },
        [onViewModeChange, viewMode]
    );

    const applySort = useCallback(
        (nextSort: BrowserSortState) => {
            if (sort === undefined) setInternalSort(nextSort);
            onSortChange?.(nextSort);
        },
        [onSortChange, sort]
    );

    const applySelection = useCallback(
        (nextSelection: BrowserSelection) => {
            if (selection === undefined) setInternalSelection(nextSelection);
            onSelectionChange?.(nextSelection);
        },
        [onSelectionChange, selection]
    );

    const focusItem = useCallback(
        (item: BrowserItem) => {
            applySelection(makeSelection(currentSelection.selectedIds, item.id, currentSelection.anchorId));
        },
        [applySelection, currentSelection.anchorId, currentSelection.selectedIds]
    );

    const selectSingle = useCallback(
        (item: BrowserItem) => {
            if (!canSelect(item)) {
                focusItem(item);
                return;
            }
            applySelection(makeSelection([item.id], item.id, item.id));
        },
        [applySelection, focusItem]
    );

    const toggleSelection = useCallback(
        (item: BrowserItem) => {
            if (!canSelect(item)) {
                focusItem(item);
                return;
            }
            const next = new Set(currentSelection.selectedIds);
            if (next.has(item.id)) next.delete(item.id);
            else next.add(item.id);
            applySelection(makeSelection(Array.from(next), item.id, currentSelection.anchorId ?? item.id));
        },
        [applySelection, currentSelection.anchorId, currentSelection.selectedIds, focusItem]
    );

    const selectRange = useCallback(
        (item: BrowserItem) => {
            if (!canSelect(item)) {
                focusItem(item);
                return;
            }
            const anchorId = currentSelection.anchorId ?? currentSelection.focusedId ?? item.id;
            const anchorIndex = visibleItems.findIndex((candidate) => candidate.id === anchorId);
            const itemIndex = visibleItems.findIndex((candidate) => candidate.id === item.id);
            if (anchorIndex < 0 || itemIndex < 0) {
                selectSingle(item);
                return;
            }
            const [start, end] = anchorIndex < itemIndex ? [anchorIndex, itemIndex] : [itemIndex, anchorIndex];
            const selectedIds = visibleItems.slice(start, end + 1).filter(canSelect).map((candidate) => candidate.id);
            applySelection(makeSelection(selectedIds, item.id, anchorId));
        },
        [applySelection, currentSelection.anchorId, currentSelection.focusedId, focusItem, selectSingle, visibleItems]
    );

    const openItem = useCallback(
        (item: BrowserItem) => {
            if (!canOpen(item)) return;
            if (item.kind === 'folder') {
                const folder = browserItemToFolder(item);
                const event: BrowserShellNavigateEvent = { folder, folderId: folder.id, sourceItem: item };
                onNavigateFolder?.(event);
                return;
            }
            onOpen?.({ item, itemId: item.id });
        },
        [onNavigateFolder, onOpen]
    );

    const previewItem = useCallback(
        (item: BrowserItem) => {
            if (canPreview(item)) onPreview?.({ item, itemId: item.id });
        },
        [onPreview]
    );

    const triggerAction = useCallback(
        (action: BrowserAction, item?: BrowserItem) => {
            const event = createActionEvent(action, currentSelection, visibleItems, item);
            onAction?.(event);
            setContextMenu(null);
        },
        [currentSelection, onAction, visibleItems]
    );

    const handleItemClick = useCallback(
        (event: MouseEvent, item: BrowserItem) => {
            if (event.shiftKey) selectRange(item);
            else if (event.ctrlKey || event.metaKey) toggleSelection(item);
            else selectSingle(item);
        },
        [selectRange, selectSingle, toggleSelection]
    );

    const moveFocus = useCallback(
        (offset: number) => {
            if (visibleItems.length === 0) return;
            const baseIndex = focusedIndex >= 0 ? focusedIndex : 0;
            const nextIndex = Math.min(Math.max(baseIndex + offset, 0), visibleItems.length - 1);
            focusItem(visibleItems[nextIndex]);
        },
        [focusItem, focusedIndex, visibleItems]
    );

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLDivElement>) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
                event.preventDefault();
                applySelection(makeSelection(visibleItems.filter(canSelect).map((item) => item.id), currentSelection.focusedId));
                return;
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                setContextMenu(null);
                applySelection(makeSelection([], currentSelection.focusedId));
                return;
            }
            if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
                event.preventDefault();
                moveFocus(1);
                return;
            }
            if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
                event.preventDefault();
                moveFocus(-1);
                return;
            }
            if (event.key === 'Home' && visibleItems[0]) {
                event.preventDefault();
                focusItem(visibleItems[0]);
                return;
            }
            if (event.key === 'End' && visibleItems[visibleItems.length - 1]) {
                event.preventDefault();
                focusItem(visibleItems[visibleItems.length - 1]);
                return;
            }
            const focusedItem = currentSelection.focusedId
                ? visibleItems.find((item) => item.id === currentSelection.focusedId)
                : visibleItems[0];
            if (!focusedItem) return;
            if (event.key === 'Enter') {
                event.preventDefault();
                openItem(focusedItem);
            } else if (event.key === ' ') {
                event.preventDefault();
                toggleSelection(focusedItem);
            }
        },
        [applySelection, currentSelection.focusedId, focusItem, moveFocus, openItem, toggleSelection, visibleItems]
    );

    useEffect(() => {
        if (!contextMenu) return undefined;
        const close = () => setContextMenu(null);
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, [contextMenu]);

    const toolbarProps: BrowserShellToolbarRenderProps = {
        actions,
        selectedItems,
        selection: currentSelection,
        sort: currentSort,
        setSort: applySort,
        triggerAction: (action) => triggerAction(action),
        viewMode: currentViewMode,
        setViewMode: applyViewMode,
    };

    const contextMenuProps: BrowserShellContextMenuRenderProps | null = contextMenu
        ? {
              actions,
              close: () => setContextMenu(null),
              item: contextMenu.item,
              selectedItems,
              selection: currentSelection,
              triggerAction: (action) => triggerAction(action, contextMenu.item),
          }
        : null;

    return (
        <div
            className={className}
            data-testid="browser-shell"
            onKeyDown={handleKeyDown}
            role="application"
            style={styles.shell}
            tabIndex={0}
        >
            <nav aria-label="Folder path" style={styles.folderChain}>
                {folderChain.map((folder, index) => (
                    <React.Fragment key={folder.id}>
                        <button
                            disabled={folder.flags?.disabled}
                            onClick={() => onNavigateFolder?.({ folder, folderId: folder.id })}
                            style={styles.breadcrumbButton}
                            type="button"
                        >
                            {folder.name}
                        </button>
                        {index < folderChain.length - 1 ? <span style={styles.breadcrumbSeparator}>/</span> : null}
                    </React.Fragment>
                ))}
            </nav>

            {renderToolbar ? renderToolbar(toolbarProps) : (
                <DefaultToolbar
                    actions={actions}
                    selectedCount={selectedItems.length}
                    sort={currentSort}
                    triggerAction={(action) => triggerAction(action)}
                    viewMode={currentViewMode}
                    onSortChange={applySort}
                    onViewModeChange={applyViewMode}
                />
            )}

            {visibleItems.length === 0 ? (
                <div style={styles.emptyState}>{emptyState ?? 'No files'}</div>
            ) : (
                <div
                    aria-label="Files"
                    data-item-count={visibleItems.length}
                    data-view-mode={currentViewMode}
                    role={currentViewMode === 'grid' ? 'grid' : 'list'}
                    style={currentViewMode === 'grid' ? styles.grid : styles.list}
                >
                    {visibleItems.map((item) => (
                        <BrowserShellItem
                            key={item.id}
                            focused={item.id === currentSelection.focusedId}
                            item={item}
                            renderThumbnail={renderThumbnail}
                            selected={selectedIdSet.has(item.id)}
                            viewMode={currentViewMode}
                            onContextMenu={(event) => {
                                event.preventDefault();
                                selectSingle(item);
                                setContextMenu({ item, x: event.clientX, y: event.clientY });
                            }}
                            onClick={(event) => handleItemClick(event, item)}
                            onDoubleClick={() => openItem(item)}
                            onOpen={() => openItem(item)}
                            onPreview={() => previewItem(item)}
                        />
                    ))}
                </div>
            )}

            {contextMenu && contextMenuProps ? (
                <div
                    data-testid="browser-context-menu"
                    role="menu"
                    style={{
                        ...styles.contextMenu,
                        left: contextMenu.x,
                        top: contextMenu.y,
                    }}
                >
                    {renderContextMenu ? renderContextMenu(contextMenuProps) : (
                        <DefaultContextMenu
                            actions={actions}
                            item={contextMenu.item}
                            selectedCount={selectedItems.length}
                            triggerAction={(action) => triggerAction(action, contextMenu.item)}
                        />
                    )}
                </div>
            ) : null}
        </div>
    );
});
BrowserShell.displayName = 'BrowserShell';

interface DefaultToolbarProps {
    actions: readonly BrowserAction[];
    selectedCount: number;
    sort: BrowserSortState;
    triggerAction: (action: BrowserAction) => void;
    viewMode: BrowserViewMode;
    onSortChange: (sort: BrowserSortState) => void;
    onViewModeChange: (viewMode: BrowserViewMode) => void;
}

const DefaultToolbar: React.FC<DefaultToolbarProps> = (props) => {
    const { actions, onSortChange, onViewModeChange, selectedCount, sort, triggerAction, viewMode } = props;
    const toolbarActions = actions.filter((action) => isActionForPlacement(action, 'toolbar'));

    return (
        <div style={styles.toolbar}>
            <div style={styles.toolbarGroup}>
                <button
                    aria-pressed={viewMode === 'list'}
                    onClick={() => onViewModeChange('list')}
                    style={viewMode === 'list' ? styles.activeButton : styles.button}
                    type="button"
                >
                    List
                </button>
                <button
                    aria-pressed={viewMode === 'grid'}
                    onClick={() => onViewModeChange('grid')}
                    style={viewMode === 'grid' ? styles.activeButton : styles.button}
                    type="button"
                >
                    Grid
                </button>
            </div>
            <label style={styles.label}>
                Sort
                <select
                    aria-label="Sort files"
                    onChange={(event) => onSortChange({ ...sort, key: event.target.value as BrowserSortState['key'] })}
                    style={styles.select}
                    value={sort.key}
                >
                    <option value="name">Name</option>
                    <option value="kind">Kind</option>
                    <option value="sizeBytes">Size</option>
                    <option value="modifiedAt">Modified</option>
                </select>
            </label>
            <button
                onClick={() => onSortChange({ ...sort, direction: sort.direction === 'asc' ? 'desc' : 'asc' })}
                style={styles.button}
                type="button"
            >
                {sort.direction === 'asc' ? 'Ascending' : 'Descending'}
            </button>
            <div style={styles.toolbarSpacer} />
            {toolbarActions.map((action) => (
                <button
                    key={action.id}
                    disabled={!isActionEnabled(action, selectedCount)}
                    onClick={() => triggerAction(action)}
                    style={action.tone === 'destructive' ? styles.destructiveButton : styles.button}
                    type="button"
                >
                    {action.label}
                </button>
            ))}
        </div>
    );
};

interface DefaultContextMenuProps {
    actions: readonly BrowserAction[];
    item: BrowserItem;
    selectedCount: number;
    triggerAction: (action: BrowserAction) => void;
}

const DefaultContextMenu: React.FC<DefaultContextMenuProps> = (props) => {
    const { actions, selectedCount, triggerAction } = props;
    const contextActions = actions.filter((action) => isActionForPlacement(action, 'context-menu'));

    if (contextActions.length === 0) return <div style={styles.menuEmpty}>No actions</div>;

    return (
        <>
            {contextActions.map((action) => (
                <button
                    key={action.id}
                    disabled={!isActionEnabled(action, selectedCount)}
                    onClick={() => triggerAction(action)}
                    role="menuitem"
                    style={action.tone === 'destructive' ? styles.menuItemDestructive : styles.menuItem}
                    type="button"
                >
                    {action.label}
                </button>
            ))}
        </>
    );
};

interface BrowserShellItemProps {
    focused: boolean;
    item: BrowserItem;
    renderThumbnail?: (item: BrowserItem) => React.ReactNode;
    selected: boolean;
    viewMode: BrowserViewMode;
    onClick: (event: MouseEvent) => void;
    onContextMenu: (event: MouseEvent) => void;
    onDoubleClick: () => void;
    onOpen: () => void;
    onPreview: () => void;
}

const BrowserShellItem: React.FC<BrowserShellItemProps> = (props) => {
    const { focused, item, onClick, onContextMenu, onDoubleClick, onOpen, onPreview, renderThumbnail, selected, viewMode } = props;
    const disabled = isDisabled(item);
    const thumbnailUrl = getAvailableThumbnail(item);
    const itemStyle = viewMode === 'grid' ? styles.gridItem : styles.listItem;

    return (
        <div
            aria-disabled={disabled}
            aria-selected={selected}
            data-focused={focused ? 'true' : 'false'}
            data-testid="browser-item"
            onClick={onClick}
            onContextMenu={onContextMenu}
            onDoubleClick={onDoubleClick}
            role={viewMode === 'grid' ? 'gridcell' : 'listitem'}
            style={{
                ...itemStyle,
                ...(selected ? styles.selectedItem : null),
                ...(focused ? styles.focusedItem : null),
                ...(disabled ? styles.disabledItem : null),
            }}
        >
            <div aria-hidden style={viewMode === 'grid' ? styles.gridThumbnail : styles.listThumbnail}>
                {renderThumbnail ? renderThumbnail(item) : (
                    <DefaultThumbnail item={item} thumbnailUrl={thumbnailUrl} />
                )}
            </div>
            <div style={styles.itemBody}>
                <span style={styles.itemName}>{item.name}</span>
                <span style={styles.itemMeta}>
                    {item.kind === 'folder' ? `${item.childCount ?? 0} items` : formatSize(item.sizeBytes)}
                    {item.source?.label ? ` · ${item.source.label}` : ''}
                </span>
            </div>
            <div style={styles.itemActions}>
                {canPreview(item) ? (
                    <button onClick={(event) => { event.stopPropagation(); onPreview(); }} style={styles.inlineButton} type="button">
                        Preview
                    </button>
                ) : null}
                {canOpen(item) ? (
                    <button onClick={(event) => { event.stopPropagation(); onOpen(); }} style={styles.inlineButton} type="button">
                        Open
                    </button>
                ) : null}
            </div>
        </div>
    );
};

const DefaultThumbnail: React.FC<{ item: BrowserItem; thumbnailUrl: string | null }> = ({ item, thumbnailUrl }) => {
    if (thumbnailUrl) {
        return <div style={{ ...styles.thumbnailImage, backgroundImage: `url("${thumbnailUrl}")` }} />;
    }
    return <span style={styles.thumbnailFallback}>{item.kind === 'folder' ? 'Folder' : item.extension ?? item.preview?.renderer ?? 'File'}</span>;
};

const styles: Record<string, CSSProperties> = {
    activeButton: {
        background: '#111827',
        border: '1px solid #111827',
        borderRadius: 8,
        color: '#fff',
        cursor: 'pointer',
        padding: '6px 10px',
    },
    breadcrumbButton: {
        background: 'transparent',
        border: 0,
        color: '#334155',
        cursor: 'pointer',
        fontSize: 13,
        padding: '4px 2px',
    },
    breadcrumbSeparator: {
        color: '#94a3b8',
        margin: '0 6px',
    },
    button: {
        background: '#fff',
        border: '1px solid #d1d5db',
        borderRadius: 8,
        color: '#111827',
        cursor: 'pointer',
        padding: '6px 10px',
    },
    contextMenu: {
        background: '#fff',
        border: '1px solid #d1d5db',
        borderRadius: 10,
        boxShadow: '0 16px 40px rgba(15, 23, 42, 0.18)',
        minWidth: 180,
        padding: 6,
        position: 'fixed',
        zIndex: 20,
    },
    destructiveButton: {
        background: '#fff',
        border: '1px solid #fecaca',
        borderRadius: 8,
        color: '#b91c1c',
        cursor: 'pointer',
        padding: '6px 10px',
    },
    disabledItem: {
        cursor: 'not-allowed',
        opacity: 0.48,
    },
    emptyState: {
        alignItems: 'center',
        color: '#64748b',
        display: 'flex',
        minHeight: 220,
        justifyContent: 'center',
    },
    focusedItem: {
        outline: '2px solid #2563eb',
        outlineOffset: -2,
    },
    folderChain: {
        alignItems: 'center',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        minHeight: 36,
        overflowX: 'auto',
        padding: '0 12px',
        whiteSpace: 'nowrap',
    },
    grid: {
        display: 'grid',
        gap: 12,
        gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))',
        padding: 12,
    },
    gridItem: {
        alignItems: 'stretch',
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 166,
        overflow: 'hidden',
    },
    gridThumbnail: {
        alignItems: 'center',
        background: '#f8fafc',
        display: 'flex',
        height: 92,
        justifyContent: 'center',
    },
    inlineButton: {
        background: '#f8fafc',
        border: '1px solid #e5e7eb',
        borderRadius: 999,
        color: '#334155',
        cursor: 'pointer',
        fontSize: 12,
        padding: '4px 8px',
    },
    itemActions: {
        alignItems: 'center',
        display: 'flex',
        gap: 6,
        padding: '0 10px 10px',
    },
    itemBody: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        gap: 2,
        minWidth: 0,
        padding: '8px 10px',
    },
    itemMeta: {
        color: '#64748b',
        fontSize: 12,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    itemName: {
        color: '#0f172a',
        fontSize: 13,
        fontWeight: 600,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    label: {
        alignItems: 'center',
        color: '#475569',
        display: 'flex',
        fontSize: 12,
        gap: 6,
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        padding: 8,
    },
    listItem: {
        alignItems: 'center',
        background: '#fff',
        border: '1px solid transparent',
        borderRadius: 10,
        cursor: 'pointer',
        display: 'flex',
        minHeight: 54,
    },
    listThumbnail: {
        alignItems: 'center',
        background: '#f8fafc',
        borderRadius: 8,
        display: 'flex',
        height: 38,
        justifyContent: 'center',
        marginLeft: 8,
        width: 46,
    },
    menuEmpty: {
        color: '#64748b',
        fontSize: 13,
        padding: '8px 10px',
    },
    menuItem: {
        background: 'transparent',
        border: 0,
        borderRadius: 8,
        color: '#0f172a',
        cursor: 'pointer',
        display: 'block',
        padding: '8px 10px',
        textAlign: 'left',
        width: '100%',
    },
    menuItemDestructive: {
        background: 'transparent',
        border: 0,
        borderRadius: 8,
        color: '#b91c1c',
        cursor: 'pointer',
        display: 'block',
        padding: '8px 10px',
        textAlign: 'left',
        width: '100%',
    },
    select: {
        border: '1px solid #d1d5db',
        borderRadius: 8,
        padding: '6px 8px',
    },
    selectedItem: {
        background: '#eff6ff',
        borderColor: '#93c5fd',
    },
    shell: {
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 14,
        color: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, sans-serif',
        minHeight: 360,
        overflow: 'hidden',
    },
    thumbnailFallback: {
        color: '#475569',
        fontSize: 12,
        fontWeight: 600,
        textTransform: 'uppercase',
    },
    thumbnailImage: {
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        height: '100%',
        width: '100%',
    },
    toolbar: {
        alignItems: 'center',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        gap: 8,
        minHeight: 46,
        padding: '8px 12px',
    },
    toolbarGroup: {
        display: 'flex',
        gap: 6,
    },
    toolbarSpacer: {
        flex: 1,
    },
};
