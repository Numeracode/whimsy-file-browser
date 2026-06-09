export type PreviewGatewayFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type PreviewGatewayBinary = Blob | ArrayBuffer | Uint8Array;

export interface GotenbergHealthOptions {
    baseUrl: string;
    fetchImpl?: PreviewGatewayFetch;
    signal?: AbortSignal;
}

export interface GotenbergHealthResult {
    ok: boolean;
    status: number;
    body: unknown;
}

export interface ConvertOfficeDocumentToPdfOptions {
    baseUrl: string;
    fileName: string;
    source: PreviewGatewayBinary;
    mimeType?: string;
    outputFileName?: string;
    traceId?: string;
    fetchImpl?: PreviewGatewayFetch;
    signal?: AbortSignal;
}

export interface ConvertedPreviewDocument {
    bytes: Uint8Array;
    contentType: string;
    fileName: string;
}

export class PreviewGatewayError extends Error {
    readonly status: number;
    readonly code: 'BAD_INPUT' | 'CONVERSION_FAILED' | 'UNAVAILABLE';
    readonly responseText?: string;

    constructor(
        code: PreviewGatewayError['code'],
        message: string,
        options: { status?: number; responseText?: string } = {}
    ) {
        super(message);
        this.name = 'PreviewGatewayError';
        this.code = code;
        this.status = options.status ?? 500;
        this.responseText = options.responseText;
    }
}

const OFFICE_DOCUMENT_EXTENSIONS = new Set([
    'doc',
    'docx',
    'dot',
    'dotx',
    'odt',
    'rtf',
    'xls',
    'xlsx',
    'xlsm',
    'ods',
    'csv',
    'ppt',
    'pptx',
    'pps',
    'ppsx',
    'odp',
]);

const OFFICE_MIME_MARKERS = [
    'application/msword',
    'application/vnd.ms-excel',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.',
    'application/vnd.oasis.opendocument.',
    'text/rtf',
    'application/rtf',
];

export function officeExtensionFromFileName(fileName: string): string {
    const clean = String(fileName || '').split(/[?#]/, 1)[0];
    const dot = clean.lastIndexOf('.');
    if (dot < 0 || dot === clean.length - 1) return '';
    return clean.slice(dot + 1).toLowerCase();
}

export function isOfficeConversionCandidate(fileName: string, mimeType = ''): boolean {
    const ext = officeExtensionFromFileName(fileName);
    const mime = mimeType.toLowerCase();
    return OFFICE_DOCUMENT_EXTENSIONS.has(ext)
        || OFFICE_MIME_MARKERS.some((marker) => mime.startsWith(marker));
}

export function normalizeGotenbergBaseUrl(baseUrl: string): string {
    const trimmed = String(baseUrl || '').trim();
    if (!trimmed) {
        throw new PreviewGatewayError('BAD_INPUT', 'Gotenberg base URL is required', { status: 400 });
    }
    return trimmed.replace(/\/+$/, '');
}

export function defaultPdfFileName(fileName: string): string {
    const clean = String(fileName || 'preview').trim() || 'preview';
    const dot = clean.lastIndexOf('.');
    return `${dot > 0 ? clean.slice(0, dot) : clean}.pdf`;
}

export async function checkGotenbergHealth(options: GotenbergHealthOptions): Promise<GotenbergHealthResult> {
    const fetchImpl = resolveFetch(options.fetchImpl);
    const response = await fetchImpl(`${normalizeGotenbergBaseUrl(options.baseUrl)}/health`, {
        method: 'GET',
        signal: options.signal,
    });
    return {
        ok: response.ok,
        status: response.status,
        body: await readResponseBody(response),
    };
}

export async function convertOfficeDocumentToPdf(
    options: ConvertOfficeDocumentToPdfOptions
): Promise<ConvertedPreviewDocument> {
    if (!isOfficeConversionCandidate(options.fileName, options.mimeType)) {
        throw new PreviewGatewayError(
            'BAD_INPUT',
            `Unsupported Office preview source: ${options.fileName || 'unnamed file'}`,
            { status: 415 }
        );
    }

    const fetchImpl = resolveFetch(options.fetchImpl);
    const outputFileName = options.outputFileName || defaultPdfFileName(options.fileName);
    const body = new FormData();
    body.append('files', toBlob(options.source, options.mimeType), options.fileName);

    const headers: Record<string, string> = {
        'Gotenberg-Output-Filename': outputFileName,
    };
    if (options.traceId) headers['Gotenberg-Trace'] = options.traceId;

    const response = await fetchImpl(`${normalizeGotenbergBaseUrl(options.baseUrl)}/forms/libreoffice/convert`, {
        method: 'POST',
        headers,
        body,
        signal: options.signal,
    });

    if (!response.ok) {
        throw new PreviewGatewayError(
            'CONVERSION_FAILED',
            `Document conversion failed with status ${response.status}`,
            {
                status: response.status,
                responseText: await response.text().catch(() => ''),
            }
        );
    }

    return {
        bytes: new Uint8Array(await response.arrayBuffer()),
        contentType: response.headers.get('content-type') || 'application/pdf',
        fileName: outputFileName,
    };
}

function resolveFetch(fetchImpl?: PreviewGatewayFetch): PreviewGatewayFetch {
    const candidate = fetchImpl || globalThis.fetch;
    if (typeof candidate !== 'function') {
        throw new PreviewGatewayError('UNAVAILABLE', 'A fetch implementation is required', { status: 503 });
    }
    return candidate.bind(globalThis) as PreviewGatewayFetch;
}

function toBlob(source: PreviewGatewayBinary, mimeType = 'application/octet-stream'): Blob {
    if (source instanceof Blob) {
        return source;
    }
    if (source instanceof ArrayBuffer) {
        return new Blob([source], { type: mimeType });
    }
    const bytes = source as Uint8Array;
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    return new Blob([copy.buffer], { type: mimeType });
}

async function readResponseBody(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return response.json().catch(() => null);
    }
    return response.text().catch(() => '');
}
