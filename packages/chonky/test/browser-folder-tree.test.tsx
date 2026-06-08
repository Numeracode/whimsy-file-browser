import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';

import {
    BrowserDestinationPicker,
    BrowserFolderTree,
    browserFolderTreeFixtures,
    createBrowserOpaqueId,
    lazyBrowserFolderChildrenFixtures,
} from '../src';

describe('BrowserFolderTree', () => {
    it('renders fixture roots and emits opaque selected folder chains', () => {
        const onSelectedFolderChange = vi.fn();

        render(
            <BrowserFolderTree
                defaultExpandedFolderIds={[createBrowserOpaqueId('tree:private:root')]}
                roots={browserFolderTreeFixtures}
                onSelectedFolderChange={onSelectedFolderChange}
            />
        );

        fireEvent.click(screen.getByText('Projects'));

        expect(onSelectedFolderChange).toHaveBeenCalledWith(
            expect.objectContaining({
                folderId: 'tree:private:projects',
                folder: expect.objectContaining({ id: 'tree:private:projects' }),
                chain: [
                    expect.objectContaining({ id: 'tree:private:root' }),
                    expect.objectContaining({ id: 'tree:private:projects' }),
                ],
            })
        );
    });

    it('lazy-loads children once for an expanded folder and renders the result', async () => {
        const loadChildren = vi.fn(async (folder) => lazyBrowserFolderChildrenFixtures[folder.id] ?? []);

        render(
            <BrowserFolderTree
                roots={browserFolderTreeFixtures}
                loadChildren={loadChildren}
            />
        );

        fireEvent.click(screen.getByLabelText('Expand Design Google Drive'));

        await waitFor(() => expect(loadChildren).toHaveBeenCalledTimes(1));
        expect(await screen.findByText('Campaign')).toBeTruthy();
    });

    it('does not select disabled folders', () => {
        const onSelectedFolderChange = vi.fn();
        const roots = [{
            ...browserFolderTreeFixtures[0],
            disabled: true,
            disabledReason: 'Read only',
        }];

        render(<BrowserFolderTree roots={roots} onSelectedFolderChange={onSelectedFolderChange} />);

        const treeNode = screen.getByTestId('browser-folder-tree-node');
        const disabledFolderButton = within(treeNode)
            .getAllByRole('button')
            .find((button) => button.hasAttribute('disabled'));

        expect(disabledFolderButton).toBeTruthy();
        if (!disabledFolderButton) throw new Error('Expected disabled folder button');
        fireEvent.click(disabledFolderButton);

        expect(onSelectedFolderChange).not.toHaveBeenCalled();
    });
});

describe('BrowserDestinationPicker', () => {
    it('confirms the selected destination folder without host API imports', () => {
        const onConfirmDestination = vi.fn();

        render(
            <BrowserDestinationPicker
                roots={browserFolderTreeFixtures}
                defaultExpandedFolderIds={[createBrowserOpaqueId('tree:private:root')]}
                onConfirmDestination={onConfirmDestination}
            />
        );

        fireEvent.click(screen.getByText('Archive'));
        fireEvent.click(screen.getByText('Choose folder'));

        expect(onConfirmDestination).toHaveBeenCalledWith(
            expect.objectContaining({
                folderId: 'tree:private:archive',
                chain: [
                    expect.objectContaining({ id: 'tree:private:root' }),
                    expect.objectContaining({ id: 'tree:private:archive' }),
                ],
            })
        );
    });
});
