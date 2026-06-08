import type { ReactNode } from 'react';

import type {
    BrowserAction,
    BrowserFolderChainItem,
    BrowserItem,
    BrowserOpaqueId,
    BrowserSelection,
} from './browser-item.types';
import type { BrowserFileOperationEvent } from './browser-operation.types';
import type { BrowserTransferIntent } from './browser-transfer.types';

export type BrowserViewMode = 'list' | 'grid';
export type BrowserSortKey = 'name' | 'kind' | 'sizeBytes' | 'modifiedAt';
export type BrowserSortDirection = 'asc' | 'desc';

export interface BrowserSortState {
    key: BrowserSortKey;
    direction: BrowserSortDirection;
}

export interface BrowserShellItemEvent {
    item: BrowserItem;
    itemId: BrowserOpaqueId;
}

export interface BrowserShellNavigateEvent {
    folder: BrowserFolderChainItem;
    folderId: BrowserOpaqueId;
    sourceItem?: BrowserItem;
}

export interface BrowserShellActionEvent {
    action: BrowserAction;
    actionId: string;
    item?: BrowserItem;
    selectedItems: readonly BrowserItem[];
    selection: BrowserSelection;
}

export interface BrowserShellToolbarRenderProps {
    actions: readonly BrowserAction[];
    selectedItems: readonly BrowserItem[];
    selection: BrowserSelection;
    sort: BrowserSortState;
    setSort: (sort: BrowserSortState) => void;
    triggerAction: (action: BrowserAction) => void;
    viewMode: BrowserViewMode;
    setViewMode: (viewMode: BrowserViewMode) => void;
}

export interface BrowserShellContextMenuRenderProps {
    actions: readonly BrowserAction[];
    item: BrowserItem;
    selectedItems: readonly BrowserItem[];
    selection: BrowserSelection;
    close: () => void;
    triggerAction: (action: BrowserAction) => void;
}

export interface BrowserShellProps {
    items: readonly BrowserItem[];
    folderChain?: readonly BrowserFolderChainItem[];
    actions?: readonly BrowserAction[];
    viewMode?: BrowserViewMode;
    defaultViewMode?: BrowserViewMode;
    onViewModeChange?: (viewMode: BrowserViewMode) => void;
    sort?: BrowserSortState;
    defaultSort?: BrowserSortState;
    onSortChange?: (sort: BrowserSortState) => void;
    selection?: BrowserSelection;
    defaultSelection?: BrowserSelection;
    onSelectionChange?: (selection: BrowserSelection) => void;
    onOpen?: (event: BrowserShellItemEvent) => void;
    onPreview?: (event: BrowserShellItemEvent) => void;
    onNavigateFolder?: (event: BrowserShellNavigateEvent) => void;
    onAction?: (event: BrowserShellActionEvent) => void;
    onFileOperation?: (event: BrowserFileOperationEvent) => void;
    onTransferIntent?: (event: BrowserTransferIntent) => void;
    renderToolbar?: (props: BrowserShellToolbarRenderProps) => ReactNode;
    renderContextMenu?: (props: BrowserShellContextMenuRenderProps) => ReactNode;
    renderThumbnail?: (item: BrowserItem) => ReactNode;
    emptyState?: ReactNode;
    className?: string;
}
