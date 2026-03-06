export const apiConfig = {
    azureTenantId: import.meta.env.VITE_AZURE_TENANT_ID || "0cd02bb5-3c24-4f77-8b19-99223d65aa67",
    storageApiEndpoint: import.meta.env.VITE_STORAGE_API_ENDPOINT || "http://localhost:10000", // "http://172.16.0.4", //"https://stor6aq2g56sfcosi.blob.core.windows.net",
    photoApiEndpoint: import.meta.env.VITE_PHOTO_API_ENDPOINT || "http://localhost:8080/api" //"http://172.16.0.5:8080/api" // "https://photo.yellowocean-9bbacae4.uksouth.azurecontainerapps.io/api", 
}
