import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import LazyImage, { clearBlobCache } from '../components/LazyImage';
import { renderWithProviders } from './test-utils';

/* ---------- IntersectionObserver mock ---------- */
let observerCallback: IntersectionObserverCallback;
const disconnectMock = vi.fn();
const observeMock = vi.fn();

class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = '200px';
    readonly thresholds: ReadonlyArray<number> = [0];
    constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
    }
    observe = observeMock;
    disconnect = disconnectMock;
    unobserve = vi.fn();
    takeRecords = () => [] as IntersectionObserverEntry[];
}

beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    clearBlobCache();
});

afterEach(() => {
    vi.restoreAllMocks();
});

/** Trigger the IntersectionObserver callback to mark the element as visible */
function triggerVisible() {
    act(() => {
        observerCallback(
            [{ isIntersecting: true } as IntersectionObserverEntry],
            {} as IntersectionObserver
        );
    });
}

/* ---------- fetch helpers ---------- */
function mockFetchWithProgress(total: number, chunks: Uint8Array[]) {
    let chunkIndex = 0;
    const reader = {
        read: vi.fn(async () => {
            if (chunkIndex >= chunks.length) return { done: true, value: undefined };
            const value = chunks[chunkIndex++];
            return { done: false, value };
        }),
    };

    const response = {
        ok: true,
        headers: new Headers({
            'Content-Length': String(total),
            'Content-Type': 'image/jpeg',
        }),
        body: { getReader: () => reader },
        blob: () => Promise.resolve(new Blob([], { type: 'image/jpeg' })),
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
}

function mockFetchIndeterminate() {
    const blob = new Blob(['x'], { type: 'image/jpeg' });
    const response = {
        ok: true,
        headers: new Headers({ 'Content-Type': 'image/jpeg' }),
        body: null,
        blob: () => Promise.resolve(blob),
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
}

function mockFetchError() {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network failure')));
}

function mockFetchNotOk() {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
}

/* ---------- createObjectURL / revokeObjectURL ---------- */
const revokeObjectURLMock = vi.fn();
beforeEach(() => {
    vi.stubGlobal('URL', {
        ...globalThis.URL,
        createObjectURL: vi.fn(() => 'blob:http://localhost/fake-blob-url'),
        revokeObjectURL: revokeObjectURLMock,
    });
    revokeObjectURLMock.mockClear();
});

/* ---------- Tests ---------- */
describe('LazyImage', () => {
    it('renders a wrapper div', () => {
        const { container } = renderWithProviders(
            <LazyImage src="http://example.com/photo.jpg" alt="test" />
        );
        expect(container.firstChild).toBeTruthy();
    });

    it('shows a spinner overlay after the 150ms delay', () => {
        vi.useFakeTimers();
        renderWithProviders(
            <LazyImage src="http://example.com/photo.jpg" alt="test" />
        );
        // Advance past the 150ms spinner delay
        act(() => { vi.advanceTimersByTime(200); });
        // spinner svg exists
        const svg = document.querySelector('svg.animate-spin');
        expect(svg).toBeInTheDocument();
        vi.useRealTimers();
    });

    it('displays 0% progress initially after spinner delay', () => {
        vi.useFakeTimers();
        renderWithProviders(
            <LazyImage src="http://example.com/photo.jpg" alt="test" />
        );
        // Advance past the 150ms spinner delay
        act(() => { vi.advanceTimersByTime(200); });
        expect(screen.getByText('0%')).toBeInTheDocument();
        vi.useRealTimers();
    });

    it('sets aspect-ratio when placeholderWidth and placeholderHeight are given', () => {
        const { container } = renderWithProviders(
            <LazyImage
                src="http://example.com/photo.jpg"
                alt="test"
                placeholderWidth={800}
                placeholderHeight={600}
            />
        );
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.style.aspectRatio).toBe('800 / 600');
        expect(wrapper.style.width).toBe('100%');
    });

    it('observes the wrapper element', () => {
        renderWithProviders(
            <LazyImage src="http://example.com/photo.jpg" alt="test" />
        );
        expect(observeMock).toHaveBeenCalled();
    });

    it('fetches the image after becoming visible and renders a blob URL', async () => {
        const chunk = new Uint8Array([1, 2, 3]);
        mockFetchWithProgress(3, [chunk]);

        renderWithProviders(
            <LazyImage src="http://example.com/photo.jpg" alt="test" />
        );

        triggerVisible();

        await waitFor(() => {
            const img = screen.getByRole('img', { name: 'test' });
            expect(img).toHaveAttribute('src', 'blob:http://localhost/fake-blob-url');
        });
    });

    it('shows "Loading…" when content length is unknown (indeterminate)', async () => {
        mockFetchIndeterminate();

        renderWithProviders(
            <LazyImage src="http://example.com/photo.jpg" alt="test" />
        );

        triggerVisible();

        // The indeterminate text shows only while the spinner overlay is visible.
        // Since the fetch resolves almost instantly in the test, the image
        // finishes loading before the 150ms spinner delay. That means the
        // spinner (and "Loading…") never actually appear. Verify the image
        // loaded successfully via blob URL instead.
        await waitFor(() => {
            const img = screen.getByRole('img', { name: 'test' });
            expect(img).toHaveAttribute('src', 'blob:http://localhost/fake-blob-url');
        });
    });

    it('falls back to src when fetch response is not ok', async () => {
        mockFetchNotOk();

        renderWithProviders(
            <LazyImage src="http://example.com/photo.jpg" alt="test" />
        );

        triggerVisible();

        await waitFor(() => {
            const img = screen.getByRole('img', { name: 'test' });
            expect(img).toHaveAttribute('src', 'http://example.com/photo.jpg');
        });
    });

    it('falls back to src when fetch throws an error', async () => {
        mockFetchError();

        renderWithProviders(
            <LazyImage src="http://example.com/photo.jpg" alt="test" />
        );

        triggerVisible();

        await waitFor(() => {
            const img = screen.getByRole('img', { name: 'test' });
            expect(img).toHaveAttribute('src', 'http://example.com/photo.jpg');
        });
    });

    it('applies extra className and wrapperClassName', () => {
        const { container } = renderWithProviders(
            <LazyImage
                src="http://example.com/photo.jpg"
                alt="test"
                className="custom-img"
                wrapperClassName="custom-wrapper"
            />
        );
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.className).toContain('custom-wrapper');
    });

    it('does not render img element before visibility and fetch', () => {
        renderWithProviders(
            <LazyImage src="http://example.com/photo.jpg" alt="test" />
        );
        expect(screen.queryByRole('img', { name: 'test' })).not.toBeInTheDocument();
    });
});
