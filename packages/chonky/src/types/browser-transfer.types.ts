import type {
    BrowserFolderChainItem,
    BrowserItem,
    BrowserOpaqueId,
    BrowserSelection,
} from './browser-item.types';

export type BrowserTransferOperation = 'copy' | 'move';
export type BrowserDropTargetKind = 'folder' | 'listing';

export interface BrowserTransferModifierState {
    altKey?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
}

export interface BrowserTransferTarget {
    kind: BrowserDropTargetKind;
    folder?: BrowserFolderChainItem;
    folderId?: BrowserOpaqueId;
    item?: BrowserItem;
}

export interface BrowserTransferIntent {
    operation: BrowserTransferOperation;
    sourceItems: readonly BrowserItem[];
    sourceIds: readonly BrowserOpaqueId[];
    selection: BrowserSelection;
    activeItem: BrowserItem;
    activeItemId: BrowserOpaqueId;
    destination: BrowserTransferTarget;
    destinationFolderId?: BrowserOpaqueId;
    modifiers: BrowserTransferModifierState;
}

export interface BrowserTransferSourceSnapshot {
    item: BrowserItem;
    selectedItems: readonly BrowserItem[];
    selection: BrowserSelection;
}

export interface BrowserTransferDropSnapshot {
    target: BrowserTransferTarget;
}
