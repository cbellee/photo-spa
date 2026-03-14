/**
 * AllAlbums — Displays all albums across every collection in a flat
 * responsive grid. Fetches the tag map to discover collections, then
 * loads album data for each collection in parallel. Each album
 * thumbnail links to its Photos view via /:collection/:album.
 * Uses RowsPhotoAlbum for layout and LazyImage for progressive loading.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RowsPhotoAlbum } from 'react-photo-album';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { fetchAlbums, fetchTags } from '../services/photoService';
import type { CollectionPhoto } from '../types';
import LoadingSpinner from './LoadingSpinner';
import Breadcrumb from './Breadcrumb';
import LazyImage from './LazyImage';

import 'react-photo-album/rows.css';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

const AllAlbums: React.FC = () => {
    const [photos, setPhotos] = useState<CollectionPhoto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [emptyMessage, setEmptyMessage] = useState<string | null>(null);
    const { theme } = useTheme();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        let cancelled = false;

        async function loadAllAlbums() {
            try {
                // 1. Discover all collections via the tags endpoint.
                const tags = await fetchTags();
                const collections = Object.keys(tags);

                if (collections.length === 0) {
                    if (!cancelled) {
                        setEmptyMessage('No albums found.');
                        setIsLoading(false);
                    }
                    return;
                }

                // 2. Fetch albums for every collection in parallel.
                const results = await Promise.allSettled(
                    collections.map((c) => fetchAlbums(c, isAuthenticated)),
                );

                if (cancelled) return;

                const allAlbums: CollectionPhoto[] = [];
                for (const result of results) {
                    if (result.status === 'fulfilled') {
                        allAlbums.push(...result.value);
                    }
                }

                setPhotos(allAlbums);
                setEmptyMessage(allAlbums.length === 0 ? 'No albums found.' : null);
            } catch (err) {
                console.error('Failed to load all albums', err);
                if (!cancelled) {
                    setEmptyMessage('Failed to load albums. Please try again later.');
                    setPhotos([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        loadAllAlbums();
        return () => { cancelled = true; };
    }, [isAuthenticated]);

    return (
        <div className="animate-appear">
            <Breadcrumb segments={[{ label: 'albums' }]} />

            <LoadingSpinner visible={isLoading} />
            {emptyMessage && !isLoading && (
                <p className={`text-center py-12 text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {emptyMessage}
                </p>
            )}
            <RowsPhotoAlbum
                photos={photos}
                padding={0}
                spacing={6}
                targetRowHeight={220}
                rowConstraints={{ singleRowMaxHeight: 280 }}
                render={{
                    photo: (_props, { photo, index, width }) => (
                        <div className="group" key={`allalbum-${photo.collection}-${photo.album}-${index}`} style={{ width }}>
                            <Link to={`/${photo.collection}/${photo.album}`}>
                                <div className={`overflow-hidden rounded-sm relative transition-all duration-300 ${
                                    theme === 'dark'
                                        ? 'shadow-card group-hover:shadow-card-hover'
                                        : 'shadow-card-light group-hover:shadow-card-light-hover'
                                }`}>
                                    <LazyImage
                                        src={photo.src}
                                        key={index}
                                        placeholderWidth={photo.width}
                                        placeholderHeight={photo.height}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                            </Link>
                            <div className="mt-2 px-1">
                                <Link
                                    to={`/${photo.collection}/${photo.album}`}
                                    className={`text-sm font-medium transition-colors ${
                                        theme === 'dark'
                                            ? 'text-gray-300 hover:text-accent-light'
                                            : 'text-gray-700 hover:text-accent'
                                    }`}
                                >
                                    {photo.album.toLowerCase()}
                                </Link>
                                <span className={`text-xs ml-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {photo.collection.toLowerCase()}
                                </span>
                            </div>
                        </div>
                    ),
                }}
            />
        </div>
    );
};

export default AllAlbums;
