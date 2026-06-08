import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import {
    FilePreviewer,
    MediaLightbox,
    PreviewShell,
    PreviewTile,
    browserItemFixtures,
} from '../src';
import type { BrowserItem, PreviewDescriptor, PreviewRendererRegistry } from '../src';

const itemById = (id: string): BrowserItem => {
    const item = browserItemFixtures.find((candidate) => candidate.id === id);
    if (!item) throw new Error(`Missing fixture ${id}`);
    return item;
};

describe('PreviewShell', () => {
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
        const loader = vi.fn(async (): Promise<PreviewDescriptor> => ({
            renderer: 'pdf',
            preview: {
                status: 'available',
                kind: 'preview',
                url: 'https://signed.example.test/private-file.pdf',
                contentType: 'application/pdf',
            },
        }));
        const item = { ...itemById('preview:none'), preview: undefined };

        render(<PreviewShell item={item} loadPreview={loader} />);

        expect(screen.getByText('Loading preview...')).toBeTruthy();
        expect(await screen.findByTestId('preview-pdf')).toBeTruthy();
        expect(loader).toHaveBeenCalledWith({ item, reason: 'initial' });
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

    it('wraps previews in a reusable media lightbox', () => {
        const onOpenChange = vi.fn();
        render(<MediaLightbox item={itemById('image:hero')} onOpenChange={onOpenChange} open />);

        expect(screen.getByRole('dialog')).toBeTruthy();
        expect(screen.getByTestId('preview-image')).toBeTruthy();
        fireEvent.click(screen.getByLabelText('Close preview'));
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });
});
