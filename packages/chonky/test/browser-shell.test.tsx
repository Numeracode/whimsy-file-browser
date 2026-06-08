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
        expect(screen.getByTestId('browser-shell').querySelector('[data-view-mode="list"]')?.getAttribute('data-item-count')).toBe('1005');

        rerender(<BrowserShell items={items} viewMode="grid" />);

        expect(screen.getByTestId('browser-shell').querySelector('[data-view-mode="grid"]')?.getAttribute('data-item-count')).toBe('1005');
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
        const lastSelection = onSelectionChange.mock.calls[onSelectionChange.mock.calls.length - 1][0] as BrowserSelection;
        expect(lastSelection.selectedIds.length).toBeGreaterThan(10);
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
});
