import apiClient from './apiClient';
import type { Person, Face, FaceOverlay, PhotoRef } from '../types';

function authHeaders(token: string) {
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
}

// ── Public (no auth) ────────────────────────────────────────────────

/** Fetch all persons, ordered by name. */
export function fetchPeople(): Promise<Person[]> {
    return apiClient.get<Person[]>('/people').then(res => res.data);
}

/** Search persons by name prefix. */
export function searchPeople(query: string): Promise<Person[]> {
    return apiClient.get<Person[]>('/people/search', {
        params: { q: query },
    }).then(res => res.data);
}

/** Fetch a single person by ID. */
export function fetchPerson(personID: string): Promise<Person> {
    return apiClient.get<Person>(`/people/${encodeURIComponent(personID)}`).then(res => res.data);
}

/** Fetch photo refs for a person (paginated). */
export function fetchPersonPhotos(
    personID: string,
    offset = 0,
    limit = 50,
): Promise<PhotoRef[]> {
    return apiClient.get<PhotoRef[]>(`/people/${encodeURIComponent(personID)}/photos`, {
        params: { offset, limit },
    }).then(res => res.data);
}

/** Fetch face overlays for a specific photo. */
export function fetchFaceOverlays(
    collection: string,
    album: string,
    name: string,
): Promise<FaceOverlay[]> {
    return apiClient.get<FaceOverlay[]>(
        `/faces/photo/${encodeURIComponent(collection)}/${encodeURIComponent(album)}/${encodeURIComponent(name)}`,
    ).then(res => res.data);
}

/** Fetch all faces belonging to a person. */
export function fetchFacesByPerson(personID: string): Promise<Face[]> {
    return apiClient.get<Face[]>(`/faces/person/${encodeURIComponent(personID)}`).then(res => res.data);
}

// ── Admin (requires auth token) ─────────────────────────────────────

/** Set / update the display name for a person. */
export async function setPersonName(
    personID: string,
    name: string,
    token: string,
): Promise<{ message: string; personID: string; name: string }> {
    const res = await apiClient.put(
        `/people/${encodeURIComponent(personID)}/name`,
        { name },
        { headers: authHeaders(token) },
    );
    return res.data;
}

/** Merge two persons (move all faces from source into target). */
export async function mergePeople(
    sourcePersonID: string,
    targetPersonID: string,
    token: string,
): Promise<{ message: string; sourcePersonID: string; targetPersonID: string }> {
    const res = await apiClient.post(
        `/people/merge`,
        { sourcePersonID, targetPersonID },
        { headers: authHeaders(token) },
    );
    return res.data;
}
