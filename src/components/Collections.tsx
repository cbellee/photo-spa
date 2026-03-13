/**
 * Collections — Top-level gallery page that fetches and displays all
 * photo collections as a responsive row-based grid. Each collection
 * thumbnail links to its AlbumCollections view. Uses RowsPhotoAlbum
 * for the masonry-style layout and LazyImage for progressive loading.
 * Authenticated users see inline admin controls (rename, delete,
 * rotate thumbnail, change thumbnail).
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RowsPhotoAlbum } from 'react-photo-album';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { fetchCollections } from '../services/photoService';
import {
    renameCollection,
    softDeleteCollection,
    restoreCollection,
    updateCollectionThumbnail,
    fetchCollectionPhotos,
} from '../services/adminService';
import type { CollectionPhoto, Photo } from '../types';
import LoadingSpinner from './LoadingSpinner';
import Breadcrumb from './Breadcrumb';
import LazyImage from './LazyImage';
import AdminControls from './AdminControls';
import ThumbnailPicker from './ThumbnailPicker';

import "react-photo-album/rows.css";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

interface CollectionsProps {
    collection: string;
    album: string;
}

const Collections: React.FC<CollectionsProps> = () => {
    const [photos, setPhotos] = useState<CollectionPhoto[]>([]);
    const [isLoading, setisLoading] = useState(true);
    const [emptyMessage, setEmptyMessage] = useState<string | null>(null);
    const { theme } = useTheme();
    const { isAuthenticated, token } = useAuth();
    const navigate = useNavigate();

    // Thumbnail picker state
    const [pickerCollection, setPickerCollection] = useState<string | null>(null);
    const [pickerPhotos, setPickerPhotos] = useState<Photo[]>([]);

    // Track per-collection orientation for optimistic rotate
    const [orientations, setOrientations] = useState<Record<string, number>>({});

    const loadCollections = (includeDeleted: boolean) => {
        fetchCollections(includeDeleted)
            .then(data => {
                setPhotos(data);
                const savedOrientations: Record<string, number> = {};
                for (const p of data) {
                    if (p.orientation) savedOrientations[p.collection] = p.orientation;
                }
                setOrientations(savedOrientations);
                setEmptyMessage(data.length === 0 ? 'No collections found.' : null);
                setisLoading(false);
            })
            .catch(error => {
                console.error(error);
                if (error?.response?.status === 404) {
                    setEmptyMessage('No collections found.');
                } else {
                    setEmptyMessage('Failed to load collections. Please try again later.');
                }
                setPhotos([]);
                setisLoading(false);
            });
    };

    useEffect(() => { loadCollections(isAuthenticated); }, [isAuthenticated]);

    const handleRename = async (collection: string, newName: string) => {
        if (!token) return;
        await renameCollection(collection, newName, token);
        navigate(`/${newName}`);
    };

    const handleDelete = async (collection: string) => {
        if (!token) return;
        await softDeleteCollection(collection, token);
        // Optimistically mark as deleted instead of removing
        setPhotos(prev => prev.map(p => p.collection === collection ? { ...p, isDeleted: true } : p));
    };

    const handleRestore = async (collection: string) => {
        if (!token) return;
        await restoreCollection(collection, token);
        // Optimistically mark as not deleted
        setPhotos(prev => prev.map(p => p.collection === collection ? { ...p, isDeleted: false } : p));
    };

    const handleRotateThumbnail = async (collection: string) => {
        if (!token) return;
        const current = orientations[collection] ?? 0;
        const next = (current + 90) % 360;
        setOrientations(prev => ({ ...prev, [collection]: next }));
        await updateCollectionThumbnail(collection, { orientation: next }, token);
    };

    const handleOpenThumbnailPicker = async (collection: string) => {
        setPickerCollection(collection);
        try {
            const allPhotos = await fetchCollectionPhotos(collection);
            setPickerPhotos(allPhotos);
        } catch (err) {
            console.error('Failed to load photos for thumbnail picker', err);
            setPickerCollection(null);
        }
    };

    const handleSelectThumbnail = async (imageName: string) => {
        if (!token || !pickerCollection) return;
        await updateCollectionThumbnail(pickerCollection, { imageName }, token);
        setPickerCollection(null);
        setPickerPhotos([]);
        loadCollections(isAuthenticated);
    };

    return (
        <div className="animate-appear">
            <Breadcrumb segments={[{ label: 'Collections' }]} />

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
                    photo: ({ onClick }, { photo, index, width, height }) => (
                        <div className="group animate-appear" key={`col-${photo.collection}-${index}`} style={{ width, animationDelay: `${index * 50}ms` }}>
                            <Link to={photo.isDeleted ? '#' : photo.collection} onClick={photo.isDeleted ? (e) => e.preventDefault() : undefined}>
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
                                            transform: orientations[photo.collection]
                                                ? `rotate(${orientations[photo.collection]}deg) scale(1.4)`
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
                                    to={photo.isDeleted ? '#' : photo.collection}
                                    onClick={photo.isDeleted ? (e) => e.preventDefault() : undefined}
                                    className={`text-sm font-medium transition-colors ${photo.isDeleted ? 'line-through opacity-50' : ''} ${
                                        theme === 'dark'
                                            ? 'text-gray-300 hover:text-accent-light'
                                            : 'text-gray-700 hover:text-accent'
                                    }`}
                                >
                                    {photo.collection}
                                </Link>
                            </div>
                            <AdminControls
                                name={photo.collection}
                                onRename={(newName) => handleRename(photo.collection, newName)}
                                onDelete={() => handleDelete(photo.collection)}
                                onRotateThumbnail={() => handleRotateThumbnail(photo.collection)}
                                onChangeThumbnail={() => handleOpenThumbnailPicker(photo.collection)}
                                visible={isAuthenticated}
                                isDeleted={photo.isDeleted}
                                onUndelete={() => handleRestore(photo.collection)}
                            />
                        </div>
                    ),
                }}
            />

            {pickerCollection && pickerPhotos.length > 0 && (
                <ThumbnailPicker
                    title={`Choose thumbnail for "${pickerCollection}"`}
                    photos={pickerPhotos}
                    onSelect={handleSelectThumbnail}
                    onClose={() => { setPickerCollection(null); setPickerPhotos([]); }}
                />
            )}
        </div>
    );
}

export default Collections;