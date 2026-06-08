import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import {
    FilePreviewer,
    MediaLightbox,
    PreviewShell,
    PreviewTile,
    browserItemFixtures,
    createBrowserOpaqueId,
} from '../src';
import type { BrowserItem, PreviewDescriptor, PreviewRendererRegistry } from '../src';

const itemById = (id: string): BrowserItem => {
    const item = browserItemFixtures.find((candidate) => candidate.id === id);
    if (!item) throw new Error(`Missing fixture ${id}`);
    return item;
};

describe('PreviewShell', () => {
    const imageDescriptor: PreviewDescriptor = {
        renderer: 'image',
        preview: {
            status: 'available',
            kind: 'preview',
            url: 'https://signed.example.test/recovered.jpg',
            contentType: 'image/jpeg',
        },
    };
    const pdfDescriptor: PreviewDescriptor = {
        renderer: 'pdf',
        preview: {
            status: 'available',
            kind: 'preview',
            url: 'https://signed.example.test/private-file.pdf',
            contentType: 'application/pdf',
        },
    };

    it('renders native image, video, audio, pdf, text, and code preview assets', () => {
        const cases = [
            ['image:hero', 'preview-image'],
            ['video:walkthrough', 'preview-video'],
            ['audio:jingle', 'preview-audio'],
            ['pdf:contract', 'preview-pdf'],
            ['text:notes', 'preview-text'],
            ['code:component', 'preview-code'],
        ] as const;

        for (const [id, testId] of cases) {
            const { unmount } = render(<PreviewShell item={itemById(id)} />);
            expect(screen.getByTestId(testId)).toBeTruthy();
            unmount();
        }
    });

    it('sandboxes iframe-based preview renderers', () => {
        render(<PreviewShell item={itemById('pdf:contract')} />);

        const frame = screen.getByTestId('preview-pdf');
        expect(frame.getAttribute('sandbox')).toBe('allow-downloads allow-same-origin');
        expect(frame.getAttribute('referrerpolicy')).toBe('no-referrer');
    });

    it('lazy-loads document, spreadsheet, and presentation renderers from the registry', async () => {
        const customRenderers: PreviewRendererRegistry = {
            document: {
                load: async () => ({ default: ({ item }) => <div>DOC renderer for {item.name}</div> }),
                fallback: 'Loading custom DOCX renderer',
            },
            spreadsheet: {
                load: async () => ({ default: ({ item }) => <div>XLSX renderer for {item.name}</div> }),
            },
            presentation: {
                load: async () => ({ default: ({ item }) => <div>PPTX renderer for {item.name}</div> }),
            },
        };

        render(
            <>
                <FilePreviewer item={itemById('office:proposal')} descriptor={itemById('office:proposal').preview} renderers={customRenderers} />
                <FilePreviewer item={itemById('remote:dropbox:spreadsheet')} descriptor={itemById('remote:dropbox:spreadsheet').preview} renderers={customRenderers} />
                <FilePreviewer item={itemById('remote:onedrive:presentation')} descriptor={itemById('remote:onedrive:presentation').preview} renderers={customRenderers} />
            </>
        );

        expect(await screen.findByText('DOC renderer for proposal.docx')).toBeTruthy();
        expect(await screen.findByText('XLSX renderer for forecast.xlsx')).toBeTruthy();
        expect(await screen.findByText('PPTX renderer for board-deck.pptx')).toBeTruthy();
    });

    it('loads a host-provided preview manifest without knowing auth, tokens, or provider IDs', async () => {
        const loader = vi.fn(async (): Promise<PreviewDescriptor> => pdfDescriptor);
        const item = { ...itemById('preview:none'), preview: undefined };

        render(<PreviewShell item={item} loadPreview={loader} />);

        expect(screen.getByText('Loading preview...')).toBeTruthy();
        expect(await screen.findByTestId('preview-pdf')).toBeTruthy();
        expect(loader).toHaveBeenCalledWith({ item, reason: 'initial' });
    });

    it('does not let stale host manifest responses overwrite the current item', async () => {
        let resolveFirst: ((descriptor: PreviewDescriptor) => void) | undefined;
        let resolveSecond: ((descriptor: PreviewDescriptor) => void) | undefined;
        const firstItem = {
            ...itemById('preview:none'),
            id: createBrowserOpaqueId('preview:load:first'),
            name: 'first.bin',
            preview: undefined,
        };
        const secondItem = {
            ...itemById('preview:none'),
            id: createBrowserOpaqueId('preview:load:second'),
            name: 'second.bin',
            preview: undefined,
        };
        const loader = vi.fn(({ item }): Promise<PreviewDescriptor> =>
            new Promise((resolve) => {
                if (item.id === firstItem.id) resolveFirst = resolve;
                else resolveSecond = resolve;
            })
        );

        const { rerender } = render(<PreviewShell item={firstItem} loadPreview={loader} />);
        rerender(<PreviewShell item={secondItem} loadPreview={loader} />);

        await waitFor(() => expect(loader).toHaveBeenCalledTimes(2));
        resolveSecond?.(pdfDescriptor);
        expect(await screen.findByTestId('preview-pdf')).toBeTruthy();

        resolveFirst?.(imageDescriptor);
        await waitFor(() => expect(screen.queryByTestId('preview-image')).toBeNull());
        expect(screen.getByTestId('preview-pdf')).toBeTruthy();
    });

    it('allows retry after a loader-level manifest failure before any asset exists', async () => {
        const loader = vi.fn()
            .mockRejectedValueOnce(new Error('Manifest service unavailable'))
            .mockResolvedValueOnce(imageDescriptor);
        const item = { ...itemById('preview:none'), preview: undefined };

        render(<PreviewShell item={item} loadPreview={loader} />);

        expect(await screen.findByText('Manifest service unavailable')).toBeTruthy();
        fireEvent.click(screen.getByText('Retry preview'));

        expect(await screen.findByTestId('preview-image')).toBeTruthy();
        expect(loader).toHaveBeenLastCalledWith({ item, reason: 'retry' });
    });

    it('renders signing and expiry failures with retry through the host manifest loader', async () => {
        const failedItem = itemById('preview:signing-failed');
        const loader = vi.fn(async (): Promise<PreviewDescriptor> => ({
            renderer: 'video',
            preview: {
                status: 'available',
                kind: 'preview',
                url: 'https://signed.example.test/recovered.mp4',
                contentType: 'video/mp4',
            },
        }));
        const onRetry = vi.fn();

        render(<PreviewShell item={failedItem} loadPreview={loader} onRetry={onRetry} />);

        expect(screen.getByText('Preview signing failed')).toBeTruthy();
        fireEvent.click(screen.getByText('Retry preview'));

        await waitFor(() => expect(loader).toHaveBeenCalledWith({ item: failedItem, reason: 'retry' }));
        expect(onRetry).toHaveBeenCalledWith(failedItem);
        expect(await screen.findByTestId('preview-video')).toBeTruthy();
    });

    it('renders preview tiles from thumbnails and fallback states', () => {
        const onPreview = vi.fn();
        render(
            <>
                <PreviewTile item={itemById('image:hero')} onPreview={onPreview} />
                <PreviewTile item={itemById('office:proposal')} onPreview={onPreview} />
            </>
        );

        fireEvent.click(screen.getByLabelText('Preview hero-photo.jpg'));
        expect(onPreview).toHaveBeenCalledWith(itemById('image:hero'));
        expect(screen.getByLabelText('Preview proposal.docx').getAttribute('data-preview-status')).toBe('pending');
    });

    it('does not preview disabled items from preview tiles', () => {
        const onPreview = vi.fn();
        const disabledItem = {
            ...itemById('image:hero'),
            flags: { disabled: true },
        };

        render(<PreviewTile item={disabledItem} onPreview={onPreview} />);

        const tile = screen.getByLabelText('Preview hero-photo.jpg');
        expect((tile as HTMLButtonElement).disabled).toBe(true);
        fireEvent.click(tile);
        expect(onPreview).not.toHaveBeenCalled();
    });

    it('wraps previews in a reusable keyboard-operable media lightbox', () => {
        const onOpenChange = vi.fn();
        render(<MediaLightbox item={itemById('image:hero')} onOpenChange={onOpenChange} open />);

        const dialog = screen.getByRole('dialog');
        const closeButton = screen.getByLabelText('Close preview');
        expect(dialog).toBeTruthy();
        expect(screen.getByTestId('preview-image')).toBeTruthy();
        expect(document.activeElement).toBe(closeButton);
        expect((closeButton as HTMLElement).style.height).toBe('44px');
        fireEvent.keyDown(dialog, { key: 'Escape' });
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });
});
