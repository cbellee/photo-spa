function normalizeEndpoint(rawValue: string | undefined, fallback: string): string {
    const value = (rawValue || "").trim();
    if (!value) return fallback;

    if (typeof window === "undefined") {
        return value;
    }

    try {
        const resolved = new URL(value, window.location.origin);

        // Avoid mixed-content requests when the app is served via HTTPS.
        if (window.location.protocol === "https:" && resolved.protocol === "http:") {
            resolved.protocol = "https:";
        }

        // Prefer relative paths for same-origin endpoints.
        if (resolved.origin === window.location.origin) {
            return `${resolved.pathname}${resolved.search}${resolved.hash}`;
        }

        return resolved.toString();
    } catch {
        return value;
    }
}

export const apiConfig = {
    azureTenantId: import.meta.env.VITE_AZURE_TENANT_ID || "0cd02bb5-3c24-4f77-8b19-99223d65aa67",
    storageApiEndpoint: normalizeEndpoint(import.meta.env.VITE_STORAGE_API_ENDPOINT, "/storage"),
    photoApiEndpoint: normalizeEndpoint(import.meta.env.VITE_PHOTO_API_ENDPOINT, "/api"),
    maxConcurrentUploads: Number(import.meta.env.VITE_MAX_CONCURRENT_UPLOADS) || 30,
};
