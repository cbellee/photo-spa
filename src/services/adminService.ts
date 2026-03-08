import axios from 'axios';
import { apiConfig } from '../config/apiConfig';
import type { RenameRequest, ThumbnailRequest, AdminResponse, Photo } from '../types';

const url = apiConfig.photoApiEndpoint;

function authHeaders(token: string) {
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
}

/** Rename a collection (copies all blobs to new paths). */
export async function renameCollection(
    collection: string,
    newName: string,
    token: string,
): Promise<AdminResponse> {
    const body: RenameRequest = { newName };
    const res = await axios.put<AdminResponse>(
        `${url}/rename/${encodeURIComponent(collection)}`,
        body,
        { headers: authHeaders(token) },
    );
    return res.data;
}

/** Rename an album within a collection. */
export async function renameAlbum(
    collection: string,
    album: string,
    newName: string,
    token: string,
): Promise<AdminResponse> {
    const body: RenameRequest = { newName };
    const res = await axios.put<AdminResponse>(
        `${url}/rename/${encodeURIComponent(collection)}/${encodeURIComponent(album)}`,
        body,
        { headers: authHeaders(token) },
    );
    return res.data;
}

/** Soft-delete an entire collection. */
export async function softDeleteCollection(
    collection: string,
    token: string,
): Promise<AdminResponse> {
    const res = await axios.delete<AdminResponse>(
        `${url}/${encodeURIComponent(collection)}`,
        { headers: authHeaders(token) },
    );
    return res.data;
}

/** Soft-delete an album within a collection. */
export async function softDeleteAlbum(
    collection: string,
    album: string,
    token: string,
): Promise<AdminResponse> {
    const res = await axios.delete<AdminResponse>(
        `${url}/${encodeURIComponent(collection)}/${encodeURIComponent(album)}`,
        { headers: authHeaders(token) },
    );
    return res.data;
}

/** Update the collection thumbnail (change image and/or rotate). */
export async function updateCollectionThumbnail(
    collection: string,
    req: ThumbnailRequest,
    token: string,
): Promise<void> {
    await axios.put(
        `${url}/thumbnail/${encodeURIComponent(collection)}`,
        req,
        { headers: authHeaders(token) },
    );
}

/** Update the album thumbnail (change image and/or rotate). */
export async function updateAlbumThumbnail(
    collection: string,
    album: string,
    req: ThumbnailRequest,
    token: string,
): Promise<void> {
    await axios.put(
        `${url}/thumbnail/${encodeURIComponent(collection)}/${encodeURIComponent(album)}`,
        req,
        { headers: authHeaders(token) },
    );
}

/** Fetch all photos in a collection (for thumbnail picker). */
export async function fetchCollectionPhotos(
    collection: string,
): Promise<Photo[]> {
    const res = await axios.get<Photo[]>(
        `${url}/photos/${encodeURIComponent(collection)}`,
    );
    return res.data;
}
