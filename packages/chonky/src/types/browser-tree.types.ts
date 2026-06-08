import type {
    BrowserFolderChainItem,
    BrowserItemRef,
    BrowserOpaqueId,
    BrowserSourceDescriptor,
} from './browser-item.types';

export interface BrowserFolderTreeNode {
    id: BrowserOpaqueId;
    name: string;
    ref?: BrowserItemRef;
    source?: BrowserSourceDescriptor;
    children?: readonly BrowserFolderTreeNode[];
    hasChildren?: boolean;
    disabled?: boolean;
    disabledReason?: string;
    metadata?: Readonly<Record<string, string | number | boolean | null>>;
}

export interface BrowserFolderSelectionEvent {
    folder: BrowserFolderTreeNode;
    folderId: BrowserOpaqueId;
    chain: readonly BrowserFolderChainItem[];
}

export interface BrowserFolderExpansionEvent {
    folder: BrowserFolderTreeNode;
    folderId: BrowserOpaqueId;
    expanded: boolean;
}

export type BrowserFolderChildrenLoader = (
    folder: BrowserFolderTreeNode
) => readonly BrowserFolderTreeNode[] | Promise<readonly BrowserFolderTreeNode[]>;

export interface BrowserFolderTreeProps {
    roots: readonly BrowserFolderTreeNode[];
    loadChildren?: BrowserFolderChildrenLoader;
    selectedFolderId?: BrowserOpaqueId;
    defaultSelectedFolderId?: BrowserOpaqueId;
    expandedFolderIds?: readonly BrowserOpaqueId[];
    defaultExpandedFolderIds?: readonly BrowserOpaqueId[];
    onSelectedFolderChange?: (event: BrowserFolderSelectionEvent) => void;
    onFolderExpansionChange?: (event: BrowserFolderExpansionEvent) => void;
    className?: string;
}

export interface BrowserDestinationPickerProps extends BrowserFolderTreeProps {
    title?: string;
    confirmLabel?: string;
    onConfirmDestination?: (event: BrowserFolderSelectionEvent) => void;
}
