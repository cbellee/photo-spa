import apiClient from './apiClient';
import type { CollectionPhoto, Photo, TagsResponse } from '../types';

export function fetchCollections(includeDeleted = false): Promise<CollectionPhoto[]> {
    return apiClient.get<CollectionPhoto[]>('', {
        params: includeDeleted ? { includeDeleted: 'true' } : undefined,
    }).then(res => res.data);
}

export function fetchAlbums(collection: string, includeDeleted = false): Promise<CollectionPhoto[]> {
    const params = includeDeleted ? '?includeDeleted=true' : '';
    return apiClient.get<CollectionPhoto[]>(`/${collection}${params}`).then(res => res.data);
}

export function fetchPhotos(collection: string, album: string, includeDeleted = false): Promise<Photo[]> {
    const params = includeDeleted ? '?includeDeleted=true' : '';
    return apiClient.get<Photo[]>(`/${collection}/${album}${params}`).then(res => res.data);
}

export function fetchTags(): Promise<TagsResponse> {
    return apiClient.get<TagsResponse>('/tags').then(res => res.data);
}
