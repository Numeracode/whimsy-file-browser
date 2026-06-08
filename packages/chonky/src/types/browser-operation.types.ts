import type {
    BrowserAction,
    BrowserFileOperationKind,
    BrowserFolderChainItem,
    BrowserItem,
    BrowserOpaqueId,
    BrowserSelection,
} from './browser-item.types';

export interface BrowserFileOperationEvent {
    operation: BrowserFileOperationKind;
    action: BrowserAction;
    actionId: string;
    item?: BrowserItem;
    itemId?: BrowserOpaqueId;
    selectedItems: readonly BrowserItem[];
    selectedIds: readonly BrowserOpaqueId[];
    selection: BrowserSelection;
    targetFolder?: BrowserFolderChainItem;
    payload?: Readonly<Record<string, unknown>>;
}
