import type {
    BrowserAction,
    BrowserActionPlacement,
    BrowserActionSelectionScope,
    BrowserActionTone,
    BrowserFileOperationKind,
    BrowserItem,
    BrowserSelection,
} from '../types/browser-item.types';
import type { BrowserFileOperationEvent } from '../types/browser-operation.types';

type BrowserActionPreset = readonly [
    BrowserFileOperationKind,
    string,
    string,
    readonly BrowserActionPlacement[],
    BrowserActionSelectionScope,
    BrowserActionTone?,
];

const ROW_ACTION = ['context-menu', 'row'] as const;
const CONTEXT_ACTION = ['context-menu'] as const;
const TOOLBAR_ACTION = ['toolbar'] as const;
const TOOLBAR_CONTEXT_ACTION = ['toolbar', 'context-menu'] as const;

const DEFAULT_ACTION_PRESETS = [
    ['open', 'Open', 'open', ROW_ACTION, 'single'],
    ['preview', 'Preview', 'preview', ROW_ACTION, 'single'],
    ['download', 'Download', 'download', TOOLBAR_CONTEXT_ACTION, 'any'],
    ['rename', 'Rename', 'rename', CONTEXT_ACTION, 'single'],
    ['delete', 'Delete', 'trash', TOOLBAR_CONTEXT_ACTION, 'any', 'destructive'],
    ['favorite', 'Favorite', 'star', CONTEXT_ACTION, 'single'],
    ['copy', 'Copy', 'copy', TOOLBAR_CONTEXT_ACTION, 'any'],
    ['move', 'Move', 'move', TOOLBAR_CONTEXT_ACTION, 'any'],
    ['paste', 'Paste', 'paste', TOOLBAR_CONTEXT_ACTION, 'none'],
    ['new-folder', 'New folder', 'folder-plus', TOOLBAR_CONTEXT_ACTION, 'none'],
    ['upload', 'Upload', 'upload', TOOLBAR_ACTION, 'none'],
] as const satisfies readonly BrowserActionPreset[];

function createActionFromPreset([
    operation,
    label,
    icon,
    placement,
    selectionScope,
    tone,
]: BrowserActionPreset): BrowserAction {
    return {
        id: operation,
        label,
        operation,
        icon,
        placement,
        selectionScope,
        ...(tone ? { tone } : {}),
    };
}

export const BROWSER_FILE_OPERATION_ACTIONS: readonly BrowserAction[] = DEFAULT_ACTION_PRESETS.map(createActionFromPreset);

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
