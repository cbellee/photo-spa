import { useState, useEffect } from 'react';
import { fetchTags } from '../services/photoService';

/** Module-level cache so tags survive component remounts during navigation. */
let cachedTags: Map<string, string[]> | null = null;

export function useTags() {
    const [collectionAlbumData, setCollectionAlbumData] = useState<Map<string, string[]>>(
        () => cachedTags ?? new Map(),
    );

    useEffect(() => {
        if (cachedTags) return; // already fetched

        fetchTags()
            .then((data) => {
                const map = new Map<string, string[]>();
                for (const [collection, albums] of Object.entries(data)) {
                    if (!map.has(collection)) {
                        map.set(collection, albums);
                    }
                }
                cachedTags = map;
                setCollectionAlbumData(map);
            })
            .catch((error) => {
                console.error('Error fetching tags:', error);
            });
    }, []);

    return { collectionAlbumData };
}

/** Clear the cached tags (useful for testing or forced refresh). */
export function clearTagCache() {
    cachedTags = null;
}
