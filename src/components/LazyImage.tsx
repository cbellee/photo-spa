import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    /** Extra classes applied to the wrapper div */
    wrapperClassName?: string;
    /** Original image width – used to set aspect-ratio on the placeholder */
    placeholderWidth?: number;
    /** Original image height – used to set aspect-ratio on the placeholder */
    placeholderHeight?: number;
}

/**
 * An <img> wrapper that fetches the image via fetch + ReadableStream to
 * track download progress. Displays a spinner with a percentage when the
 * server exposes Content-Length, otherwise shows "Loading…".
 */
const LazyImage: React.FC<LazyImageProps> = ({
    wrapperClassName = '',
    className = '',
    src,
    onLoad,
    placeholderWidth,
    placeholderHeight,
    ...rest
}) => {
    const [loaded, setLoaded] = useState(false);
    const [progress, setProgress] = useState(0);
    const [indeterminate, setIndeterminate] = useState(false);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    // Observe visibility – start loading only when the element is near the viewport
    useEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Fetch image only after it becomes visible
    useEffect(() => {
        if (!isVisible || !src) return;

        // Reset state when src changes
        setLoaded(false);
        setProgress(0);
        setIndeterminate(false);
        setBlobUrl(null);

        const controller = new AbortController();
        abortRef.current = controller;

        (async () => {
            try {
                const response = await fetch(src, { signal: controller.signal });

                if (!response.ok) {
                    // Fall back to native loading
                    setBlobUrl(src);
                    return;
                }

                const contentLength = response.headers.get('Content-Length');
                const total = contentLength ? parseInt(contentLength, 10) : 0;

                if (!total || !response.body) {
                    // Content-Length not exposed (CORS) or no ReadableStream support
                    setIndeterminate(true);
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    setBlobUrl(url);
                    setProgress(100);
                    return;
                }

                const reader = response.body.getReader();
                const chunks: BlobPart[] = [];
                let received = 0;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    chunks.push(value);
                    received += value.length;

                    const pct = Math.round((received / total) * 100);
                    setProgress(pct);
                }

                const blob = new Blob(chunks, {
                    type: response.headers.get('Content-Type') || 'image/jpeg',
                });
                const url = URL.createObjectURL(blob);
                setBlobUrl(url);
                setProgress(100);
            } catch (err: unknown) {
                if (err instanceof DOMException && err.name === 'AbortError') return;
                // Fall back to native loading on fetch failure
                setBlobUrl(src);
                setProgress(100);
            }
        })();

        return () => {
            controller.abort();
        };
    }, [isVisible, src]);

    // Revoke object URL on unmount or when it changes
    useEffect(() => {
        return () => {
            if (blobUrl && blobUrl !== src) {
                URL.revokeObjectURL(blobUrl);
            }
        };
    }, [blobUrl, src]);

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        setLoaded(true);
        onLoad?.(e);
    };

    // Build inline style for aspect-ratio placeholder so the div has
    // real dimensions before the image loads, enabling IntersectionObserver
    const placeholderStyle: React.CSSProperties | undefined =
        placeholderWidth && placeholderHeight
            ? { aspectRatio: `${placeholderWidth} / ${placeholderHeight}`, width: '100%' }
            : undefined;

    return (
        <div ref={wrapperRef} className={`relative ${wrapperClassName}`} style={placeholderStyle}>
            {/* spinner overlay – visible until image loads */}
            {!loaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/30 rounded-md z-10">
                    <svg
                        className="animate-spin h-8 w-8 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                    <span className="mt-1 text-xs font-semibold text-white drop-shadow">
                        {indeterminate ? 'Loading\u2026' : `${progress}%`}
                    </span>
                </div>
            )}

            {blobUrl && (
                <img
                    {...rest}
                    src={blobUrl}
                    className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={handleLoad}
                />
            )}
        </div>
    );
};

export default LazyImage;
