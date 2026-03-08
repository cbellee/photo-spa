/** Photo as returned by the collections/albums endpoints (simplified) */
export interface CollectionPhoto {
    id: string;
    url: string;
    src: string;
    width: number;
    height: number;
    collection: string;
    album: string;
    orientation: number;
}

/** Full photo with all metadata, as returned by the photos endpoint */
export interface Photo {
    name: string;
    id: string;
    url: string;
    src: string;
    width: number;
    height: number;
    collection: string;
    albumImage: boolean;
    collectionImage: boolean;
    album: string;
    description: string;
    exifData?: string;
    isDeleted: boolean;
    orientation: number;
}

/** Image preview data used during upload */
export interface ImagePreview {
    uploading: boolean;
    uploadComplete: boolean;
    uploadError?: boolean;
    src: string;
    width: number;
    height: number;
    name: string;
    type: string;
    size: number;
    collection: string;
    album: string;
    collectionImage: boolean;
    albumImage: boolean;
    description: string;
    length: number;
    uploadProgress?: number;
    orientation?: number;
    isDeleted?: boolean;
}

/** Photo data sent during upload */
export interface UploadPhoto {
    name: string;
    collection: string;
    album: string;
    collectionImage: boolean;
    albumImage: boolean;
    description: string;
    orientation: string;
    isDeleted: boolean;
    size: number;
    type: string;
}

/** Photo data sent during update (all fields stringified) */
export interface UpdatePhoto {
    name: string;
    collection: string;
    collectionImage: string;
    albumImage: string;
    album: string;
    description: string;
    orientation: string;
    isDeleted: string;
}

/** Tags response: collection name → array of album names */
export type TagsResponse = Record<string, string[]>;

/** Request body for rename operations */
export interface RenameRequest {
    newName: string;
}

/** Request body for thumbnail operations */
export interface ThumbnailRequest {
    imageName?: string;
    orientation?: number;
}

/** Generic API response for admin operations */
export interface AdminResponse {
    message: string;
    affected?: number;
    newName?: string;
    errors?: string[];
}

/** Route params for collection-level routes */
export interface CollectionRouteParams extends Record<string, string | undefined> {
    collection: string;
}

/** Route params for photo-level routes */
export interface PhotoRouteParams extends Record<string, string | undefined> {
    collection: string;
    album: string;
}
