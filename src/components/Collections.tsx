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
import Box from "@mui/material/Box";
import { RowsPhotoAlbum } from 'react-photo-album';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { fetchCollections } from '../services/photoService';
import {
    renameCollection,
    softDeleteCollection,
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
    const [isEditing, setIsEditing] = useState(false);

    const loadCollections = () => {
        fetchCollections()
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

    useEffect(() => { loadCollections(); }, []);

    const handleRename = async (collection: string, newName: string) => {
        if (!token) return;
        await renameCollection(collection, newName, token);
        navigate(`/${newName}`);
    };

    const handleDelete = async (collection: string) => {
        if (!token) return;
        await softDeleteCollection(collection, token);
        setPhotos(prev => prev.filter(p => p.collection !== collection));
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
        loadCollections();
    };

    return (
        <div>
            <Box sx={{ width: "90%", mx: "auto" }}>
                <Breadcrumb segments={[{ label: 'Collections' }]} />
                {isAuthenticated && !isLoading && (
                    <div className={`flex flex-wrap gap-x-4 gap-y-3 px-4 py-3 items-center rounded-md ${theme === 'dark' ? 'bg-gray-800/60 text-gray-200 border border-gray-700' : 'bg-white/80 text-gray-600 border border-gray-200 shadow-sm'}`}>
                        <div className="flex-1" />
                        <button
                            className={`h-8 text-md font-semibold w-24 rounded-md ${theme === 'dark' ? 'hover:bg-gray-100 bg-gray-300 text-gray-600' : 'hover:bg-gray-400 bg-gray-500 text-gray-100'} active:animate-pop`}
                            onClick={() => setIsEditing(prev => !prev)}
                        >
                            {isEditing ? 'Done' : 'Edit'}
                        </button>
                    </div>
                )}
                <LoadingSpinner visible={isLoading} />
                {emptyMessage && !isLoading && (
                    <p className={`text-center py-12 text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {emptyMessage}
                    </p>
                )}
                <RowsPhotoAlbum
                    photos={photos}
                    padding={0}
                    spacing={0}
                    targetRowHeight={200}
                    rowConstraints={{ singleRowMaxHeight: 250 }}
                    render={{
                        photo: ({ onClick }, { photo, index }) => (
                            <div className="p-1 pt-4" key={`col-${photo.collection}-${index}`}>
                                <Link to={photo.collection}>
                                    <div className="overflow-hidden rounded-sm max-h-56">
                                        <LazyImage
                                            src={photo.src}
                                            key={index}
                                            placeholderWidth={photo.width}
                                            placeholderHeight={photo.height}
                                            className="hover:opacity-85 w-full h-full object-cover"
                                            style={{
                                                transform: orientations[photo.collection]
                                                    ? `rotate(${orientations[photo.collection]}deg) scale(1.4)`
                                                    : undefined,
                                                transition: 'transform 0.3s ease',
                                            }}
                                        />
                                    </div>
                                </Link>
                                <div className="flex items-center justify-between">
                                    <Link to={photo.collection} className={`uppercase text-sm underline ${theme === 'dark' ? 'text-blue-500' : 'text-blue-700'}`}>{photo.collection}</Link>
                                </div>
                                <AdminControls
                                    name={photo.collection}
                                    onRename={(newName) => handleRename(photo.collection, newName)}
                                    onDelete={() => handleDelete(photo.collection)}
                                    onRotateThumbnail={() => handleRotateThumbnail(photo.collection)}
                                    onChangeThumbnail={() => handleOpenThumbnailPicker(photo.collection)}
                                    visible={isAuthenticated && isEditing}
                                />
                            </div>
                        ),
                    }}
                />
            </Box>

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