import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';

import {
    BrowserShell,
    browserActionFixtures,
    browserFolderChainFixtures,
    browserItemFixtures,
    createBrowserOpaqueId,
} from '../src';
import type { BrowserItem, BrowserSelection } from '../src';

const makeLargeFixture = (count: number): BrowserItem[] => {
    const sourceItems = browserItemFixtures.filter((item) => item.kind === 'file');
    return Array.from({ length: count }, (_, index) => {
        const source = sourceItems[index % sourceItems.length];
        return {
            ...source,
            id: createBrowserOpaqueId(`large:${index}`),
            name: `Large fixture ${String(index).padStart(4, '0')}${source.extension ?? ''}`,
        };
    });
};

describe('BrowserShell', () => {
    it('renders 1000+ BrowserItems in list and grid modes', () => {
        const items = makeLargeFixture(1005);
        const { rerender } = render(<BrowserShell items={items} viewMode="list" />);

        expect(screen.getByText('Large fixture 0000.jpg')).toBeTruthy();
        expect((screen.getByTestId('browser-shell').querySelector('[data-view-mode="list"]') as HTMLElement).dataset.itemCount).toBe('1005');

        rerender(<BrowserShell items={items} viewMode="grid" />);

        expect((screen.getByTestId('browser-shell').querySelector('[data-view-mode="grid"]') as HTMLElement).dataset.itemCount).toBe('1005');
    }, 10000);

    it('fires selection, open, preview, and folder navigation callbacks with opaque IDs', () => {
        const onSelectionChange = vi.fn();
        const onOpen = vi.fn();
        const onPreview = vi.fn();
        const onNavigateFolder = vi.fn();

        render(
            <BrowserShell
                folderChain={browserFolderChainFixtures}
                items={browserItemFixtures}
                onNavigateFolder={onNavigateFolder}
                onOpen={onOpen}
                onPreview={onPreview}
                onSelectionChange={onSelectionChange}
            />
        );

        fireEvent.click(screen.getByText('hero-photo.jpg'));
        expect(onSelectionChange).toHaveBeenLastCalledWith(
            expect.objectContaining({ selectedIds: ['image:hero'], focusedId: 'image:hero' })
        );

        fireEvent.doubleClick(screen.getByText('hero-photo.jpg'));
        expect(onOpen).toHaveBeenCalledWith(
            expect.objectContaining({ itemId: 'image:hero', item: expect.objectContaining({ id: 'image:hero' }) })
        );

        const heroItem = screen.getByText('hero-photo.jpg').closest('[data-testid="browser-item"]');
        expect(heroItem).toBeTruthy();
        fireEvent.click(within(heroItem as HTMLElement).getByText('Preview'));
        expect(onPreview).toHaveBeenCalledWith(
            expect.objectContaining({ itemId: 'image:hero', item: expect.objectContaining({ id: 'image:hero' }) })
        );

        fireEvent.click(screen.getByText('Projects'));
        expect(onNavigateFolder).toHaveBeenCalledWith(
            expect.objectContaining({ folderId: 'folder:projects', folder: expect.objectContaining({ id: 'folder:projects' }) })
        );

        fireEvent.doubleClick(screen.getByText('Brand assets'));
        expect(onNavigateFolder).toHaveBeenCalledWith(
            expect.objectContaining({ folderId: 'folder:brand-assets', sourceItem: expect.objectContaining({ id: 'folder:brand-assets' }) })
        );
    });

    it('supports controlled and uncontrolled selection modes', () => {
        const uncontrolledSelection = vi.fn();
        const uncontrolled = render(
            <BrowserShell
                defaultSelection={{ selectedIds: ['image:hero'].map(createBrowserOpaqueId) }}
                items={browserItemFixtures}
                onSelectionChange={uncontrolledSelection}
            />
        );

        expect(screen.getByText('hero-photo.jpg').closest('[data-testid="browser-item"]')?.getAttribute('aria-selected')).toBe('true');
        fireEvent.click(screen.getByText('contract.pdf'));
        expect(uncontrolledSelection).toHaveBeenCalledWith(
            expect.objectContaining({ selectedIds: ['pdf:contract'], focusedId: 'pdf:contract' })
        );
        expect(screen.getByText('contract.pdf').closest('[data-testid="browser-item"]')?.getAttribute('aria-selected')).toBe('true');
        uncontrolled.unmount();

        const controlledSelection: BrowserSelection = {
            selectedIds: ['video:walkthrough'].map(createBrowserOpaqueId),
            focusedId: createBrowserOpaqueId('video:walkthrough'),
        };
        const controlledChange = vi.fn();
        render(<BrowserShell items={browserItemFixtures} selection={controlledSelection} onSelectionChange={controlledChange} />);

        expect(screen.getByText('walkthrough.mp4').closest('[data-testid="browser-item"]')?.getAttribute('aria-selected')).toBe('true');
        fireEvent.click(screen.getByText('contract.pdf'));
        expect(controlledChange).toHaveBeenCalledWith(
            expect.objectContaining({ selectedIds: ['pdf:contract'], focusedId: 'pdf:contract' })
        );
        expect(screen.getByText('contract.pdf').closest('[data-testid="browser-item"]')?.getAttribute('aria-selected')).toBe('false');
    });

    it('supports keyboard shortcuts for selection and opening focused items', () => {
        const onSelectionChange = vi.fn();
        const onOpen = vi.fn();

        render(
            <BrowserShell
                defaultSelection={{ selectedIds: [], focusedId: createBrowserOpaqueId('image:hero') }}
                items={browserItemFixtures}
                onOpen={onOpen}
                onSelectionChange={onSelectionChange}
            />
        );

        const shell = screen.getByTestId('browser-shell');
        shell.focus();
        fireEvent.keyDown(shell, { key: ' ' });
        expect(onSelectionChange).toHaveBeenCalledWith(
            expect.objectContaining({ focusedId: 'image:hero', selectedIds: ['image:hero'] })
        );

        fireEvent.keyDown(shell, { key: 'Enter' });
        expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ itemId: 'image:hero' }));

        fireEvent.keyDown(shell, { key: 'a', ctrlKey: true });
        const lastSelection = onSelectionChange.mock.lastCall?.[0] as BrowserSelection;
        expect(lastSelection.selectedIds.length).toBeGreaterThan(10);
    });

    it('focuses the first item on first forward arrow key when no item is focused', () => {
        const onSelectionChange = vi.fn();

        render(<BrowserShell items={browserItemFixtures} onSelectionChange={onSelectionChange} />);

        const shell = screen.getByTestId('browser-shell');
        shell.focus();
        fireEvent.keyDown(shell, { key: 'ArrowDown' });

        expect(onSelectionChange).toHaveBeenCalledWith(
            expect.objectContaining({ focusedId: 'local:private:backup', selectedIds: [] })
        );
        const activeDescendant = shell.getAttribute('aria-activedescendant');
        expect(activeDescendant).toBeTruthy();
        expect(document.getElementById(activeDescendant!)?.textContent).toContain('backup.zip');
    });

    it('allows hosts to replace toolbar, context menu, and thumbnail rendering', () => {
        const onAction = vi.fn();
        render(
            <BrowserShell
                actions={browserActionFixtures}
                items={browserItemFixtures}
                onAction={onAction}
                renderContextMenu={({ item, triggerAction, actions }) => (
                    <button type="button" onClick={() => triggerAction(actions[0])}>
                        Custom menu for {item.name}
                    </button>
                )}
                renderThumbnail={(item) => <span>thumb:{item.id}</span>}
                renderToolbar={({ setViewMode }) => (
                    <button type="button" onClick={() => setViewMode('grid')}>
                        Custom toolbar
                    </button>
                )}
            />
        );

        expect(screen.getByText('Custom toolbar')).toBeTruthy();
        expect(screen.queryByText('List')).toBeNull();
        expect(screen.getByText('thumb:image:hero')).toBeTruthy();

        fireEvent.contextMenu(screen.getByText('hero-photo.jpg'));
        fireEvent.click(screen.getByText('Custom menu for hero-photo.jpg'));

        expect(onAction).toHaveBeenCalledWith(
            expect.objectContaining({
                actionId: 'open',
                item: expect.objectContaining({ id: 'image:hero' }),
                selection: expect.objectContaining({ selectedIds: ['image:hero'] }),
            })
        );
    });

    it('keeps modified-date sorting stable for malformed dates', () => {
        const items: BrowserItem[] = [
            {
                ...browserItemFixtures[1],
                id: createBrowserOpaqueId('invalid-date'),
                name: 'invalid-date.jpg',
                modifiedAt: 'not-a-date',
            },
            {
                ...browserItemFixtures[2],
                id: createBrowserOpaqueId('valid-date'),
                name: 'valid-date.mp4',
                modifiedAt: '2026-06-02T00:00:00.000Z',
            },
            {
                ...browserItemFixtures[3],
                id: createBrowserOpaqueId('missing-date'),
                name: 'missing-date.pdf',
                modifiedAt: undefined,
            },
        ];

        render(<BrowserShell items={items} defaultSort={{ key: 'modifiedAt', direction: 'asc' }} />);

        const renderedNames = screen.getAllByTestId('browser-item').map((item) => within(item).getByText(/date\./).textContent);
        expect(renderedNames).toEqual(['invalid-date.jpg', 'missing-date.pdf', 'valid-date.mp4']);
    });

    it('does not dispatch disabled or invalid-scope custom actions', () => {
        const onAction = vi.fn();
        const downloadAction = browserActionFixtures.find((action) => action.id === 'download');
        const openAction = browserActionFixtures.find((action) => action.id === 'open');
        expect(downloadAction).toBeTruthy();
        expect(openAction).toBeTruthy();
        const disabledAction = { ...downloadAction!, disabled: true };
        const singleOnlyAction = openAction!;

        render(
            <BrowserShell
                actions={[disabledAction, singleOnlyAction]}
                items={browserItemFixtures}
                onAction={onAction}
                renderToolbar={({ actions, triggerAction }) => (
                    <>
                        <button type="button" onClick={() => triggerAction(actions[0])}>
                            Disabled action
                        </button>
                        <button type="button" onClick={() => triggerAction(actions[1])}>
                            Single action
                        </button>
                    </>
                )}
            />
        );

        fireEvent.click(screen.getByText('Disabled action'));
        fireEvent.click(screen.getByText('Single action'));

        expect(onAction).not.toHaveBeenCalled();
    });

    it('does not hijack keyboard input from interactive toolbar controls', () => {
        const onSelectionChange = vi.fn();

        render(
            <BrowserShell
                defaultSelection={{ selectedIds: [], focusedId: createBrowserOpaqueId('image:hero') }}
                items={browserItemFixtures}
                onSelectionChange={onSelectionChange}
            />
        );

        const sortSelect = screen.getByLabelText('Sort files');
        fireEvent.keyDown(sortSelect, { key: 'ArrowDown' });
        fireEvent.keyDown(sortSelect, { key: 'a', ctrlKey: true });

        expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it('preserves multi-selection when opening a context menu on an already selected item', () => {
        const onAction = vi.fn();
        const onFileOperation = vi.fn();
        const selection: BrowserSelection = {
            selectedIds: ['image:hero', 'pdf:contract'].map(createBrowserOpaqueId),
            focusedId: createBrowserOpaqueId('pdf:contract'),
            anchorId: createBrowserOpaqueId('image:hero'),
        };

        render(
            <BrowserShell
                actions={browserActionFixtures}
                items={browserItemFixtures}
                onAction={onAction}
                onFileOperation={onFileOperation}
                selection={selection}
            />
        );

        fireEvent.contextMenu(screen.getByText('hero-photo.jpg'));
        fireEvent.click(within(screen.getByTestId('browser-context-menu')).getByText('Download'));

        expect(onAction).toHaveBeenCalledWith(
            expect.objectContaining({
                actionId: 'download',
                selectedItems: expect.arrayContaining([
                    expect.objectContaining({ id: 'image:hero' }),
                    expect.objectContaining({ id: 'pdf:contract' }),
                ]),
                selection: expect.objectContaining({ selectedIds: ['image:hero', 'pdf:contract'] }),
            })
        );
        expect(onFileOperation).toHaveBeenCalledWith(
            expect.objectContaining({
                operation: 'download',
                actionId: 'download',
                selectedIds: expect.arrayContaining(['image:hero', 'pdf:contract']),
                selectedItems: expect.arrayContaining([
                    expect.objectContaining({ id: 'image:hero' }),
                    expect.objectContaining({ id: 'pdf:contract' }),
                ]),
            })
        );
    });

    it('uses the pending context-menu selection before controlled selection state updates', () => {
        const onAction = vi.fn();
        const onFileOperation = vi.fn();
        const onSelectionChange = vi.fn();
        const selection: BrowserSelection = {
            selectedIds: [],
        };

        render(
            <BrowserShell
                actions={browserActionFixtures}
                items={browserItemFixtures}
                onAction={onAction}
                onFileOperation={onFileOperation}
                onSelectionChange={onSelectionChange}
                selection={selection}
            />
        );

        fireEvent.contextMenu(screen.getByText('hero-photo.jpg'));
        fireEvent.click(within(screen.getByTestId('browser-context-menu')).getByText('Open'));

        expect(onSelectionChange).toHaveBeenCalledWith(
            expect.objectContaining({ selectedIds: ['image:hero'], focusedId: 'image:hero' })
        );
        expect(onAction).toHaveBeenCalledWith(
            expect.objectContaining({
                actionId: 'open',
                selectedItems: [expect.objectContaining({ id: 'image:hero' })],
                selection: expect.objectContaining({ selectedIds: ['image:hero'] }),
            })
        );
        expect(onFileOperation).toHaveBeenCalledWith(
            expect.objectContaining({
                operation: 'open',
                itemId: 'image:hero',
                selectedIds: ['image:hero'],
            })
        );
    });

    it('does not emit typed operations when item capabilities disallow the operation', () => {
        const onAction = vi.fn();
        const onFileOperation = vi.fn();
        const readOnlyItem: BrowserItem = {
            ...browserItemFixtures.find((item) => item.id === 'image:hero')!,
            id: createBrowserOpaqueId('readonly:image'),
            name: 'readonly.jpg',
            capabilities: {
                open: true,
                preview: true,
                select: true,
                download: true,
                delete: false,
            },
        };

        render(
            <BrowserShell
                actions={browserActionFixtures}
                defaultSelection={{ selectedIds: [readOnlyItem.id], focusedId: readOnlyItem.id }}
                items={[readOnlyItem]}
                onAction={onAction}
                onFileOperation={onFileOperation}
            />
        );

        fireEvent.click(screen.getByText('Delete'));

        expect(onAction).not.toHaveBeenCalled();
        expect(onFileOperation).not.toHaveBeenCalled();
    });

    it('exposes DnD transfer affordances only when the host handles transfer intents', () => {
        const { rerender } = render(
            <BrowserShell
                folderChain={browserFolderChainFixtures}
                items={browserItemFixtures}
            />
        );

        expect((screen.getByText('hero-photo.jpg').closest('[data-testid="browser-item"]') as HTMLElement | null)?.dataset.dndDraggable).toBe('false');
        expect(screen.getByLabelText('Files').dataset.dndDroppable).toBe('false');

        rerender(
            <BrowserShell
                folderChain={browserFolderChainFixtures}
                items={browserItemFixtures}
                onTransferIntent={vi.fn()}
            />
        );

        expect((screen.getByText('hero-photo.jpg').closest('[data-testid="browser-item"]') as HTMLElement | null)?.dataset.dndDraggable).toBe('true');
        expect((screen.getByText('Brand assets').closest('[data-testid="browser-item"]') as HTMLElement | null)?.dataset.dndDroppable).toBe('true');
        expect(screen.getByLabelText('Files').dataset.dndDroppable).toBe('true');
    });
});
