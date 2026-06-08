import React, { CSSProperties, useCallback, useMemo, useRef, useState } from 'react';

import type {
    BrowserDestinationPickerProps,
    BrowserFolderSelectionEvent,
    BrowserFolderTreeNode,
    BrowserFolderTreeProps,
} from '../../types/browser-tree.types';
import type { BrowserFolderChainItem, BrowserOpaqueId } from '../../types/browser-item.types';

type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface LoadedState {
    children: readonly BrowserFolderTreeNode[];
    error?: string;
    status: LoadStatus;
}

const nodeToChainItem = (node: BrowserFolderTreeNode): BrowserFolderChainItem => ({
    id: node.id,
    name: node.name,
    ref: node.ref,
    source: node.source,
    flags: node.disabled || node.disabledReason
        ? { disabled: node.disabled, disabledReason: node.disabledReason }
        : undefined,
});

const findNodePath = (
    nodes: readonly BrowserFolderTreeNode[],
    id: BrowserOpaqueId,
    loadedChildren: Readonly<Record<string, LoadedState>>,
    path: readonly BrowserFolderTreeNode[] = []
): readonly BrowserFolderTreeNode[] | null => {
    for (const node of nodes) {
        const nextPath = [...path, node];
        if (node.id === id) return nextPath;
        const children = loadedChildren[node.id]?.children ?? node.children ?? [];
        const found = findNodePath(children, id, loadedChildren, nextPath);
        if (found) return found;
    }
    return null;
};

const hasExpandableChildren = (node: BrowserFolderTreeNode): boolean =>
    node.hasChildren === true || Boolean(node.children?.length);

const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Failed to load folders';

export const BrowserFolderTree: React.FC<BrowserFolderTreeProps> = React.memo((props) => {
    const {
        className,
        defaultExpandedFolderIds = [],
        defaultSelectedFolderId,
        expandedFolderIds,
        loadChildren,
        onFolderExpansionChange,
        onSelectedFolderChange,
        roots,
        selectedFolderId,
    } = props;
    const [internalExpanded, setInternalExpanded] = useState<readonly BrowserOpaqueId[]>(defaultExpandedFolderIds);
    const [internalSelected, setInternalSelected] = useState<BrowserOpaqueId | undefined>(defaultSelectedFolderId);
    const [loadedChildren, setLoadedChildren] = useState<Record<string, LoadedState>>({});
    const requestSeq = useRef(0);
    const activeRequests = useRef<Record<string, number>>({});

    const currentExpanded = expandedFolderIds ?? internalExpanded;
    const currentSelected = selectedFolderId ?? internalSelected;
    const expandedSet = useMemo(() => new Set(currentExpanded), [currentExpanded]);

    const setExpanded = useCallback(
        (folderIds: readonly BrowserOpaqueId[]) => {
            if (expandedFolderIds === undefined) setInternalExpanded(folderIds);
        },
        [expandedFolderIds]
    );

    const selectNode = useCallback(
        (node: BrowserFolderTreeNode) => {
            if (node.disabled) return;
            if (selectedFolderId === undefined) setInternalSelected(node.id);
            const path = findNodePath(roots, node.id, loadedChildren) ?? [node];
            const event: BrowserFolderSelectionEvent = {
                folder: node,
                folderId: node.id,
                chain: path.map(nodeToChainItem),
            };
            onSelectedFolderChange?.(event);
        },
        [loadedChildren, onSelectedFolderChange, roots, selectedFolderId]
    );

    const loadNodeChildren = useCallback(
        (node: BrowserFolderTreeNode) => {
            if (!loadChildren || loadedChildren[node.id]?.status === 'loaded' || loadedChildren[node.id]?.status === 'loading') return;
            requestSeq.current += 1;
            const requestId = requestSeq.current;
            activeRequests.current[node.id] = requestId;
            setLoadedChildren((prev) => ({
                ...prev,
                [node.id]: { children: prev[node.id]?.children ?? node.children ?? [], status: 'loading' },
            }));
            Promise.resolve(loadChildren(node))
                .then((children) => {
                    if (activeRequests.current[node.id] !== requestId) return;
                    setLoadedChildren((prev) => ({
                        ...prev,
                        [node.id]: { children, status: 'loaded' },
                    }));
                })
                .catch((error) => {
                    if (activeRequests.current[node.id] !== requestId) return;
                    setLoadedChildren((prev) => ({
                        ...prev,
                        [node.id]: {
                            children: prev[node.id]?.children ?? node.children ?? [],
                            error: errorMessage(error),
                            status: 'error',
                        },
                    }));
                });
        },
        [loadChildren, loadedChildren]
    );

    const toggleNode = useCallback(
        (node: BrowserFolderTreeNode) => {
            if (!hasExpandableChildren(node)) return;
            const expanded = expandedSet.has(node.id);
            const nextExpanded = expanded
                ? currentExpanded.filter((folderId) => folderId !== node.id)
                : [...currentExpanded, node.id];
            setExpanded(nextExpanded);
            if (!expanded) loadNodeChildren(node);
            onFolderExpansionChange?.({ folder: node, folderId: node.id, expanded: !expanded });
        },
        [currentExpanded, expandedSet, loadNodeChildren, onFolderExpansionChange, setExpanded]
    );

    const renderNode = (node: BrowserFolderTreeNode, depth: number): React.ReactNode => {
        const loaded = loadedChildren[node.id];
        const children = loaded?.children ?? node.children ?? [];
        const expanded = expandedSet.has(node.id);
        const selected = currentSelected === node.id;
        const expandable = hasExpandableChildren(node);

        return (
            <li key={node.id} style={styles.node}>
                <div
                    aria-disabled={node.disabled}
                    aria-expanded={expandable ? expanded : undefined}
                    aria-selected={selected}
                    data-folder-id={node.id}
                    data-testid="browser-folder-tree-node"
                    role="treeitem"
                    style={{
                        ...styles.row,
                        ...(selected ? styles.selectedRow : null),
                        ...(node.disabled ? styles.disabledRow : null),
                        paddingLeft: 8 + depth * 18,
                    }}
                >
                    <button
                        aria-label={expanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
                        disabled={!expandable}
                        onClick={() => toggleNode(node)}
                        style={styles.expander}
                        type="button"
                    >
                        {expandable ? (expanded ? '▾' : '▸') : '•'}
                    </button>
                    <button
                        disabled={node.disabled}
                        onClick={() => selectNode(node)}
                        style={styles.nodeButton}
                        type="button"
                    >
                        <span style={styles.nodeName}>{node.name}</span>
                        {node.source?.label ? <span style={styles.sourceLabel}>{node.source.label}</span> : null}
                    </button>
                </div>
                {loaded?.status === 'error' ? <div style={{ ...styles.message, paddingLeft: 32 + depth * 18 }}>{loaded.error}</div> : null}
                {loaded?.status === 'loading' ? <div style={{ ...styles.message, paddingLeft: 32 + depth * 18 }}>Loading folders...</div> : null}
                {expanded && children.length > 0 ? (
                    <ul role="group" style={styles.group}>
                        {children.map((child) => renderNode(child, depth + 1))}
                    </ul>
                ) : null}
            </li>
        );
    };

    return (
        <ul aria-label="Folders" className={className} data-testid="browser-folder-tree" role="tree" style={styles.tree}>
            {roots.map((node) => renderNode(node, 0))}
        </ul>
    );
});
BrowserFolderTree.displayName = 'BrowserFolderTree';

export const BrowserDestinationPicker: React.FC<BrowserDestinationPickerProps> = (props) => {
    const {
        confirmLabel = 'Choose folder',
        onConfirmDestination,
        title = 'Choose destination',
        ...treeProps
    } = props;
    const [lastSelection, setLastSelection] = useState<BrowserFolderSelectionEvent | null>(null);

    return (
        <div data-testid="browser-destination-picker" style={styles.picker}>
            <div style={styles.pickerHeader}>{title}</div>
            <BrowserFolderTree
                {...treeProps}
                onSelectedFolderChange={(event) => {
                    setLastSelection(event);
                    treeProps.onSelectedFolderChange?.(event);
                }}
            />
            <button
                disabled={!lastSelection}
                onClick={() => {
                    if (lastSelection) onConfirmDestination?.(lastSelection);
                }}
                style={styles.confirmButton}
                type="button"
            >
                {confirmLabel}
            </button>
        </div>
    );
};

const styles: Record<string, CSSProperties> = {
    confirmButton: {
        alignSelf: 'flex-end',
        background: '#111827',
        border: 0,
        borderRadius: 8,
        color: '#fff',
        cursor: 'pointer',
        padding: '7px 12px',
    },
    disabledRow: {
        cursor: 'not-allowed',
        opacity: 0.48,
    },
    expander: {
        background: 'transparent',
        border: 0,
        color: '#475569',
        cursor: 'pointer',
        height: 28,
        width: 28,
    },
    group: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
    },
    message: {
        color: '#64748b',
        fontSize: 12,
        paddingBottom: 4,
        paddingTop: 2,
    },
    node: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
    },
    nodeButton: {
        alignItems: 'baseline',
        background: 'transparent',
        border: 0,
        color: '#0f172a',
        cursor: 'pointer',
        display: 'flex',
        flex: 1,
        gap: 8,
        minWidth: 0,
        padding: '6px 8px',
        textAlign: 'left',
    },
    nodeName: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    picker: {
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minWidth: 280,
        padding: 12,
    },
    pickerHeader: {
        color: '#0f172a',
        fontSize: 14,
        fontWeight: 700,
    },
    row: {
        alignItems: 'center',
        borderRadius: 8,
        display: 'flex',
        minHeight: 34,
    },
    selectedRow: {
        background: '#e0f2fe',
    },
    sourceLabel: {
        color: '#64748b',
        fontSize: 11,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    tree: {
        listStyle: 'none',
        margin: 0,
        maxHeight: 360,
        overflow: 'auto',
        padding: 0,
    },
};
