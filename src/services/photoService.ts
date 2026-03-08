import apiClient from './apiClient';
import type { CollectionPhoto, Photo, TagsResponse } from '../types';

export function fetchCollections(): Promise<CollectionPhoto[]> {
    return apiClient.get<CollectionPhoto[]>('').then(res => res.data);
}

export function fetchAlbums(collection: string): Promise<CollectionPhoto[]> {
    return apiClient.get<CollectionPhoto[]>(`/${collection}`).then(res => res.data);
}

export function fetchPhotos(collection: string, album: string, includeDeleted = false): Promise<Photo[]> {
    const params = includeDeleted ? '?includeDeleted=true' : '';
    return apiClient.get<Photo[]>(`/${collection}/${album}${params}`).then(res => res.data);
}

export function fetchTags(): Promise<TagsResponse> {
    return apiClient.get<TagsResponse>('/tags').then(res => res.data);
}
