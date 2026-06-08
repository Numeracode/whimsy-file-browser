import type {
    BrowserTransferDropSnapshot,
    BrowserTransferIntent,
    BrowserTransferModifierState,
    BrowserTransferOperation,
    BrowserTransferSourceSnapshot,
} from '../types/browser-transfer.types';

export const resolveBrowserTransferOperation = (
    modifiers: BrowserTransferModifierState,
    defaultOperation: BrowserTransferOperation = 'move'
): BrowserTransferOperation => {
    // Copy modifiers take precedence when combined with Shift; otherwise Shift forces move and unset modifiers use the host default.
    if (modifiers.ctrlKey || modifiers.metaKey) return 'copy';
    if (modifiers.shiftKey) return 'move';
    return defaultOperation;
};

export const createBrowserTransferIntent = (options: {
    source: BrowserTransferSourceSnapshot;
    drop: BrowserTransferDropSnapshot;
    modifiers?: BrowserTransferModifierState;
    defaultOperation?: BrowserTransferOperation;
}): BrowserTransferIntent | null => {
    const modifiers = options.modifiers ?? {};
    const sourceItems = options.source.selectedItems.length > 0
        ? options.source.selectedItems
        : [options.source.item];
    const sourceIds = sourceItems.map((item) => item.id);
    const destinationFolderId = options.drop.target.folderId;

    if (destinationFolderId && sourceIds.includes(destinationFolderId)) return null;

    return {
        operation: resolveBrowserTransferOperation(modifiers, options.defaultOperation),
        sourceItems,
        sourceIds,
        selection: options.source.selection,
        activeItem: options.source.item,
        activeItemId: options.source.item.id,
        destination: options.drop.target,
        destinationFolderId,
        modifiers,
    };
};
