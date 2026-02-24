import { useState, useEffect } from 'react';
import { fetchTags } from '../services/photoService';

export function useTags() {
    const [collectionAlbumData, setCollectionAlbumData] = useState<Map<string, string[]>>(new Map());

    useEffect(() => {
        fetchTags()
            .then((data) => {
                const map = new Map<string, string[]>();
                for (const [collection, albums] of Object.entries(data)) {
                    if (!map.has(collection)) {
                        map.set(collection, albums);
                    }
                }
                setCollectionAlbumData(map);
            })
            .catch((error) => {
                console.error('Error fetching tags:', error);
            });
    }, []);

    return { collectionAlbumData };
}
