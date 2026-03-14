/**
 * AllAlbums — Displays all albums across every collection in a flat
 * responsive grid. Fetches the tag map to discover collections, then
 * loads album data for each collection in parallel. Each album
 * thumbnail links to its Photos view via /:collection/:album.
 * Authenticated users see inline admin controls (rename, delete,
 * rotate thumbnail, change thumbnail). Uses RowsPhotoAlbum for
 * layout and LazyImage for progressive image loading.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RowsPhotoAlbum } from 'react-photo-album';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { fetchAlbums, fetchPhotos, fetchTags } from '../services/photoService';
import {
    renameAlbum,
    softDeleteAlbum,
    restoreAlbum,
    updateAlbumThumbnail,
} from '../services/adminService';
import type { CollectionPhoto, Photo } from '../types';
import LoadingSpinner from './LoadingSpinner';
import Breadcrumb from './Breadcrumb';
import LazyImage from './LazyImage';
import AdminControls from './AdminControls';
import ThumbnailPicker from './ThumbnailPicker';

import 'react-photo-album/rows.css';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

const AllAlbums: React.FC = () => {
    const [photos, setPhotos] = useState<CollectionPhoto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [emptyMessage, setEmptyMessage] = useState<string | null>(null);
    const { theme } = useTheme();
    const { isAuthenticated, token } = useAuth();
    const navigate = useNavigate();

    // Thumbnail picker state
    const [pickerCollection, setPickerCollection] = useState<string | null>(null);
    const [pickerAlbum, setPickerAlbum] = useState<string | null>(null);
    const [pickerPhotos, setPickerPhotos] = useState<Photo[]>([]);

    // Track per-album orientation for optimistic rotate (keyed by "collection/album")
    const [orientations, setOrientations] = useState<Record<string, number>>({});

    const orientationKey = (collection: string, album: string) => `${collection}/${album}`;

    const loadAllAlbums = useCallback(async () => {
        try {
            setIsLoading(true);
            const tags = await fetchTags();
            const collections = Object.keys(tags);

            if (collections.length === 0) {
                setEmptyMessage('No albums found.');
                setIsLoading(false);
                return;
            }

            const results = await Promise.allSettled(
                collections.map((c) => fetchAlbums(c, isAuthenticated)),
            );

            const allAlbums: CollectionPhoto[] = [];
            for (const result of results) {
                if (result.status === 'fulfilled') {
                    allAlbums.push(...result.value);
                }
            }

            const savedOrientations: Record<string, number> = {};
            for (const p of allAlbums) {
                if (p.orientation) savedOrientations[orientationKey(p.collection, p.album)] = p.orientation;
            }
            setOrientations(savedOrientations);
            setPhotos(allAlbums);
            setEmptyMessage(allAlbums.length === 0 ? 'No albums found.' : null);
        } catch (err) {
            console.error('Failed to load all albums', err);
            setEmptyMessage('Failed to load albums. Please try again later.');
            setPhotos([]);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => { loadAllAlbums(); }, [loadAllAlbums]);

    const handleRename = async (collection: string, album: string, newName: string) => {
        if (!token) return;
        await renameAlbum(collection, album, newName, token);
        navigate(`/${collection}/${newName}`);
    };

    const handleDelete = async (collection: string, album: string) => {
        if (!token) return;
        const result = await softDeleteAlbum(collection, album, token);
        if (result.collectionDeleted) {
            // Refresh entire list since a collection was removed
            loadAllAlbums();
            return;
        }
        setPhotos(prev => prev.map(p =>
            p.collection === collection && p.album === album ? { ...p, isDeleted: true } : p,
        ));
    };

    const handleRestore = async (collection: string, album: string) => {
        if (!token) return;
        await restoreAlbum(collection, album, token);
        setPhotos(prev => prev.map(p =>
            p.collection === collection && p.album === album ? { ...p, isDeleted: false } : p,
        ));
    };

    const handleRotateThumbnail = async (collection: string, album: string) => {
        if (!token) return;
        const key = orientationKey(collection, album);
        const current = orientations[key] ?? 0;
        const next = (current + 90) % 360;
        setOrientations(prev => ({ ...prev, [key]: next }));
        await updateAlbumThumbnail(collection, album, { orientation: next }, token);
    };

    const handleOpenThumbnailPicker = async (collection: string, album: string) => {
        setPickerCollection(collection);
        setPickerAlbum(album);
        try {
            const allPhotos = await fetchPhotos(collection, album);
            setPickerPhotos(allPhotos);
        } catch (err) {
            console.error('Failed to load photos for thumbnail picker', err);
            setPickerCollection(null);
            setPickerAlbum(null);
        }
    };

    const handleSelectThumbnail = async (imageName: string) => {
        if (!token || !pickerCollection || !pickerAlbum) return;
        await updateAlbumThumbnail(pickerCollection, pickerAlbum, { imageName }, token);
        setPickerCollection(null);
        setPickerAlbum(null);
        setPickerPhotos([]);
        loadAllAlbums();
    };

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
                    photo: (_props, { photo, index, width }) => {
                        const key = orientationKey(photo.collection, photo.album);
                        return (
                            <div className="group" key={`allalbum-${photo.collection}-${photo.album}-${index}`} style={{ width }}>
                                <Link
                                    to={photo.isDeleted ? '#' : `/${photo.collection}/${photo.album}`}
                                    onClick={photo.isDeleted ? (e) => e.preventDefault() : undefined}
                                >
                                    <div className={`overflow-hidden rounded-sm relative transition-all duration-300 ${
                                        theme === 'dark'
                                            ? 'shadow-card group-hover:shadow-card-hover'
                                            : 'shadow-card-light group-hover:shadow-card-light-hover'
                                    } ${photo.isDeleted ? 'border-2 border-red-500/70 opacity-50' : ''}`}>
                                        <LazyImage
                                            src={photo.src}
                                            key={index}
                                            placeholderWidth={photo.width}
                                            placeholderHeight={photo.height}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            style={{
                                                transform: orientations[key]
                                                    ? `rotate(${orientations[key]}deg) scale(1.4)`
                                                    : undefined,
                                                transition: 'transform 0.5s ease',
                                            }}
                                        />

                                        {photo.isDeleted && (
                                            <div className="absolute inset-0 bg-red-900/30 flex items-center justify-center pointer-events-none rounded-sm">
                                                <span className="text-red-200 font-bold text-xs uppercase tracking-widest bg-red-900/60 px-2 py-0.5 rounded">Deleted</span>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                                <div className="mt-2 px-1">
                                    <Link
                                        to={photo.isDeleted ? '#' : `/${photo.collection}/${photo.album}`}
                                        onClick={photo.isDeleted ? (e) => e.preventDefault() : undefined}
                                        className={`text-sm font-medium transition-colors ${photo.isDeleted ? 'line-through opacity-50' : ''} ${
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
                                <AdminControls
                                    name={photo.album.toLowerCase()}
                                    onRename={(newName) => handleRename(photo.collection, photo.album, newName)}
                                    onDelete={() => handleDelete(photo.collection, photo.album)}
                                    onRotateThumbnail={() => handleRotateThumbnail(photo.collection, photo.album)}
                                    onChangeThumbnail={() => handleOpenThumbnailPicker(photo.collection, photo.album)}
                                    visible={isAuthenticated}
                                    isDeleted={photo.isDeleted}
                                    onUndelete={() => handleRestore(photo.collection, photo.album)}
                                />
                            </div>
                        );
                    },
                }}
            />

            {pickerAlbum && pickerCollection && pickerPhotos.length > 0 && (
                <ThumbnailPicker
                    title={`Choose thumbnail for "${pickerAlbum}"`}
                    photos={pickerPhotos}
                    onSelect={handleSelectThumbnail}
                    onClose={() => { setPickerCollection(null); setPickerAlbum(null); setPickerPhotos([]); }}
                />
            )}
        </div>
    );
};

export default AllAlbums;
