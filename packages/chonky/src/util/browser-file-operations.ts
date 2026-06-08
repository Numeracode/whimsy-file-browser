import type {
    BrowserAction,
    BrowserFileOperationKind,
    BrowserItem,
    BrowserSelection,
} from '../types/browser-item.types';
import type { BrowserFileOperationEvent } from '../types/browser-operation.types';

export const BROWSER_FILE_OPERATION_ACTIONS: readonly BrowserAction[] = [
    {
        id: 'open',
        label: 'Open',
        operation: 'open',
        icon: 'open',
        placement: ['context-menu', 'row'],
        selectionScope: 'single',
    },
    {
        id: 'preview',
        label: 'Preview',
        operation: 'preview',
        icon: 'preview',
        placement: ['context-menu', 'row'],
        selectionScope: 'single',
    },
    {
        id: 'download',
        label: 'Download',
        operation: 'download',
        icon: 'download',
        placement: ['toolbar', 'context-menu'],
        selectionScope: 'any',
    },
    {
        id: 'rename',
        label: 'Rename',
        operation: 'rename',
        icon: 'rename',
        placement: ['context-menu'],
        selectionScope: 'single',
    },
    {
        id: 'delete',
        label: 'Delete',
        operation: 'delete',
        icon: 'trash',
        placement: ['toolbar', 'context-menu'],
        selectionScope: 'any',
        tone: 'destructive',
    },
    {
        id: 'favorite',
        label: 'Favorite',
        operation: 'favorite',
        icon: 'star',
        placement: ['context-menu'],
        selectionScope: 'single',
    },
    {
        id: 'copy',
        label: 'Copy',
        operation: 'copy',
        icon: 'copy',
        placement: ['toolbar', 'context-menu'],
        selectionScope: 'any',
    },
    {
        id: 'move',
        label: 'Move',
        operation: 'move',
        icon: 'move',
        placement: ['toolbar', 'context-menu'],
        selectionScope: 'any',
    },
    {
        id: 'paste',
        label: 'Paste',
        operation: 'paste',
        icon: 'paste',
        placement: ['toolbar', 'context-menu'],
        selectionScope: 'none',
    },
    {
        id: 'new-folder',
        label: 'New folder',
        operation: 'new-folder',
        icon: 'folder-plus',
        placement: ['toolbar', 'context-menu'],
        selectionScope: 'none',
    },
    {
        id: 'upload',
        label: 'Upload',
        operation: 'upload',
        icon: 'upload',
        placement: ['toolbar'],
        selectionScope: 'none',
    },
];

const OPERATIONS = new Set<BrowserFileOperationKind>(
    BROWSER_FILE_OPERATION_ACTIONS.map((action) => action.operation!)
);

export function fileOperationForAction(action: BrowserAction): BrowserFileOperationKind | null {
    if (action.operation) return action.operation;
    return OPERATIONS.has(action.id as BrowserFileOperationKind)
        ? action.id as BrowserFileOperationKind
        : null;
}

export function selectedItemsForOperation(
    action: BrowserAction,
    selectedItems: readonly BrowserItem[],
    item?: BrowserItem,
): readonly BrowserItem[] {
    const operation = fileOperationForAction(action);
    if (action.selectionScope === 'none' || operation === 'paste' || operation === 'new-folder' || operation === 'upload') {
        return [];
    }
    if (selectedItems.length > 0) return selectedItems;
    return item ? [item] : [];
}

function hasCapability(item: BrowserItem, operation: BrowserFileOperationKind): boolean {
    if (item.flags?.disabled) return false;
    switch (operation) {
        case 'open': return item.capabilities?.open !== false;
        case 'preview': return item.kind === 'file' && item.capabilities?.preview === true;
        case 'download': return item.kind === 'file' && item.capabilities?.download !== false;
        case 'rename': return item.capabilities?.rename === true;
        case 'delete': return item.capabilities?.delete === true;
        case 'favorite': return item.kind === 'file' && item.capabilities?.favorite === true;
        case 'copy':
        case 'move':
            return item.capabilities?.drag !== false;
        case 'paste':
        case 'new-folder':
        case 'upload':
            return true;
        default:
            return true;
    }
}

export function isSelectionScopeSatisfied(action: BrowserAction, selectedCount: number): boolean {
    if (action.disabled) return false;
    if (action.selectionScope === 'none') return selectedCount === 0;
    if (action.selectionScope === 'single') return selectedCount === 1;
    if (action.selectionScope === 'multiple') return selectedCount > 1;
    if (action.selectionScope === 'any') return selectedCount > 0;
    return true;
}

export function isBrowserActionEnabled(
    action: BrowserAction,
    selectedItems: readonly BrowserItem[],
    item?: BrowserItem,
): boolean {
    const operationTargets = selectedItemsForOperation(action, selectedItems, item);
    const selectedCount = operationTargets.length;
    if (!isSelectionScopeSatisfied(action, selectedCount)) return false;

    const operation = fileOperationForAction(action);
    if (!operation) return true;
    return operationTargets.every((target) => hasCapability(target, operation));
}

export function createBrowserFileOperationEvent(input: {
    action: BrowserAction;
    selectedItems: readonly BrowserItem[];
    selection: BrowserSelection;
    item?: BrowserItem;
    payload?: Readonly<Record<string, unknown>>;
}): BrowserFileOperationEvent | null {
    const operation = fileOperationForAction(input.action);
    if (!operation) return null;
    const selectedItems = selectedItemsForOperation(input.action, input.selectedItems, input.item);
    if (!isBrowserActionEnabled(input.action, selectedItems, input.item)) return null;

    return {
        operation,
        action: input.action,
        actionId: input.action.id,
        item: input.item,
        itemId: input.item?.id,
        selectedItems,
        selectedIds: selectedItems.map((item) => item.id),
        selection: input.selection,
        payload: input.payload,
    };
}
