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
    isDeleted: boolean;
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
    collectionDeleted?: boolean;
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

// ── Face detection / People types ───────────────────────────────────

/** Bounding box as percentages (0.0–1.0) of image dimensions. */
export interface BBox {
    x: number;
    y: number;
    w: number;
    h: number;
}

/** A photo reference (collection/album/name). */
export interface PhotoRef {
    collection: string;
    album: string;
    name: string;
}

/** A person (grouped cluster of faces). */
export interface Person {
    personID: string;
    name: string;
    faceCount: number;
    thumbnailFaceID: string;
}

/** A single detected face with recognition data. */
export interface Face {
    faceID: string;
    personID: string;
    photoRef: PhotoRef;
    bbox: BBox;
    landmarkFingerprint: number[];
    faceHash: string;
    confidence: number;
    createdAt: string;
}

/** Minimal face overlay data returned for photo display. */
export interface FaceOverlay {
    faceID: string;
    personID: string;
    personName: string;
    bbox: BBox;
}

/** Route params for person-level routes. */
export interface PersonRouteParams extends Record<string, string | undefined> {
    personID: string;
}
