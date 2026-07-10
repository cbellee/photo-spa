export const apiConfig = {
    azureTenantId: import.meta.env.VITE_AZURE_TENANT_ID || "0cd02bb5-3c24-4f77-8b19-99223d65aa67",
    storageApiEndpoint: import.meta.env.VITE_STORAGE_API_ENDPOINT || "/storage",
    photoApiEndpoint: import.meta.env.VITE_PHOTO_API_ENDPOINT || "/api",
    maxConcurrentUploads: Number(import.meta.env.VITE_MAX_CONCURRENT_UPLOADS) || 6,
};
