import { describe, expect, it, vi } from 'vitest';

import {
    PreviewGatewayError,
    checkGotenbergHealth,
    convertOfficeDocumentToPdf,
    defaultPdfFileName,
    isOfficeConversionCandidate,
} from '../src/server';

describe('preview gateway', () => {
    it('detects Office conversion candidates by extension and MIME type', () => {
        expect(isOfficeConversionCandidate('deck.pptx')).toBe(true);
        expect(isOfficeConversionCandidate('sheet.xlsx')).toBe(true);
        expect(isOfficeConversionCandidate('brief.docx')).toBe(true);
        expect(isOfficeConversionCandidate('legacy.doc')).toBe(true);
        expect(isOfficeConversionCandidate('unknown.bin', 'application/vnd.ms-powerpoint')).toBe(true);
        expect(isOfficeConversionCandidate('photo.jpg', 'image/jpeg')).toBe(false);
    });

    it('derives a PDF filename without mutating the source name', () => {
        expect(defaultPdfFileName('Client Proposal.final.docx')).toBe('Client Proposal.final.pdf');
        expect(defaultPdfFileName('README')).toBe('README.pdf');
    });

    it('posts Office bytes to the LibreOffice conversion endpoint', async () => {
        const pdfBytes = new Uint8Array([37, 80, 68, 70]);
        const fetchImpl = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => (
            new Response(pdfBytes, {
                status: 200,
                headers: { 'content-type': 'application/pdf' },
            })
        ));

        const result = await convertOfficeDocumentToPdf({
            baseUrl: 'http://gotenberg:3000/',
            fileName: 'deck.pptx',
            source: new Uint8Array([1, 2, 3, 4]),
            mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            traceId: 'req-123',
            fetchImpl,
        });

        expect(fetchImpl).toHaveBeenCalledTimes(1);
        const [url, init] = fetchImpl.mock.calls[0];
        expect(String(url)).toBe('http://gotenberg:3000/forms/libreoffice/convert');
        expect(init?.method).toBe('POST');
        expect(init?.headers).toEqual({
            'Gotenberg-Output-Filename': 'deck.pdf',
            'Gotenberg-Trace': 'req-123',
        });
        expect(init?.body).toBeInstanceOf(FormData);
        const form = init?.body as FormData;
        const file = form.get('files') as File;
        expect(file).toBeInstanceOf(File);
        expect(file.name).toBe('deck.pptx');
        expect(file.type).toBe('application/vnd.openxmlformats-officedocument.presentationml.presentation');
        expect(result.contentType).toBe('application/pdf');
        expect(Array.from(result.bytes)).toEqual(Array.from(pdfBytes));
    });

    it('rejects unsupported inputs before calling Gotenberg', async () => {
        const fetchImpl = vi.fn();

        await expect(convertOfficeDocumentToPdf({
            baseUrl: 'http://gotenberg:3000',
            fileName: 'photo.jpg',
            source: new Uint8Array([1, 2, 3]),
            mimeType: 'image/jpeg',
            fetchImpl,
        })).rejects.toMatchObject({ code: 'BAD_INPUT', status: 415 });

        expect(fetchImpl).not.toHaveBeenCalled();
    });

    it('surfaces conversion failures with status and response text', async () => {
        const fetchImpl = vi.fn(async () => (
            new Response('libreoffice crashed', { status: 503 })
        ));

        await expect(convertOfficeDocumentToPdf({
            baseUrl: 'http://gotenberg:3000',
            fileName: 'brief.docx',
            source: new Uint8Array([1, 2, 3]),
            fetchImpl,
        })).rejects.toMatchObject({
            code: 'CONVERSION_FAILED',
            status: 503,
            responseText: 'libreoffice crashed',
        });
    });

    it('checks Gotenberg health', async () => {
        const fetchImpl = vi.fn(async () => (
            Response.json({ status: 'up', details: { libreoffice: { status: 'up' } } })
        ));

        const result = await checkGotenbergHealth({
            baseUrl: 'http://gotenberg:3000',
            fetchImpl,
        });

        expect(fetchImpl).toHaveBeenCalledWith('http://gotenberg:3000/health', {
            method: 'GET',
            signal: undefined,
        });
        expect(result.ok).toBe(true);
        expect(result.status).toBe(200);
        expect(result.body).toEqual({ status: 'up', details: { libreoffice: { status: 'up' } } });
    });

    it('throws a typed error when no base URL is provided', async () => {
        await expect(checkGotenbergHealth({ baseUrl: '', fetchImpl: vi.fn() }))
            .rejects
            .toBeInstanceOf(PreviewGatewayError);
    });
});
