import apiClient from './apiClient';
import type { RenameRequest, ThumbnailRequest, AdminResponse, Photo } from '../types';

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
    const body: RenameRequest = { newName: newName.toLowerCase() };
    const res = await apiClient.put<AdminResponse>(
        `/rename/${encodeURIComponent(collection)}`,
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
    const body: RenameRequest = { newName: newName.toLowerCase() };
    const res = await apiClient.put<AdminResponse>(
        `/rename/${encodeURIComponent(collection)}/${encodeURIComponent(album)}`,
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
    const res = await apiClient.delete<AdminResponse>(
        `/${encodeURIComponent(collection)}`,
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
    const res = await apiClient.delete<AdminResponse>(
        `/${encodeURIComponent(collection)}/${encodeURIComponent(album)}`,
        { headers: authHeaders(token) },
    );
    return res.data;
}

/** Restore (undelete) a soft-deleted album. */
export async function restoreAlbum(
    collection: string,
    album: string,
    token: string,
): Promise<AdminResponse> {
    const res = await apiClient.patch<AdminResponse>(
        `/${encodeURIComponent(collection)}/${encodeURIComponent(album)}`,
        {},
        { headers: authHeaders(token) },
    );
    return res.data;
}

/** Restore (undelete) a soft-deleted collection. */
export async function restoreCollection(
    collection: string,
    token: string,
): Promise<AdminResponse> {
    const res = await apiClient.patch<AdminResponse>(
        `/${encodeURIComponent(collection)}`,
        {},
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
    await apiClient.put(
        `/thumbnail/${encodeURIComponent(collection)}`,
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
    await apiClient.put(
        `/thumbnail/${encodeURIComponent(collection)}/${encodeURIComponent(album)}`,
        req,
        { headers: authHeaders(token) },
    );
}

/** Fetch all photos in a collection (for thumbnail picker). */
export async function fetchCollectionPhotos(
    collection: string,
): Promise<Photo[]> {
    const res = await apiClient.get<Photo[]>(
        `/photos/${encodeURIComponent(collection)}`,
    );
    return res.data;
}
