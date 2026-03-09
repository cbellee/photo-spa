/**
 * AlbumCollections — Displays the albums within a single collection as a
 * responsive row-based photo grid. Fetches album data on mount using the
 * collection name from the URL params. Each album thumbnail links to its
 * Photos view. Authenticated users see inline admin controls (rename,
 * delete, rotate thumbnail, change thumbnail). Uses RowsPhotoAlbum for
 * layout and LazyImage for progressive image loading.
 */
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Box from "@mui/material/Box";
import { RowsPhotoAlbum } from 'react-photo-album';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { fetchAlbums, fetchPhotos } from '../services/photoService';
import {
    renameAlbum,
    softDeleteAlbum,
    restoreAlbum,
    updateAlbumThumbnail,
} from '../services/adminService';
import type { CollectionPhoto, CollectionRouteParams, Photo } from '../types';
import LoadingSpinner from './LoadingSpinner';
import Breadcrumb from './Breadcrumb';
import LazyImage from './LazyImage';
import AdminControls from './AdminControls';
import ThumbnailPicker from './ThumbnailPicker';

import "react-photo-album/rows.css";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

interface AlbumsProps {
    collection: string;
    album: string;
}

const Albums: React.FC<AlbumsProps> = () => {
    const [photos, setPhotos] = useState<CollectionPhoto[]>([]);
    const { theme } = useTheme();
    const { isAuthenticated, token } = useAuth();
    const [isLoading, setisLoading] = useState(true);
    const [emptyMessage, setEmptyMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    // Thumbnail picker state
    const [pickerAlbum, setPickerAlbum] = useState<string | null>(null);
    const [pickerPhotos, setPickerPhotos] = useState<Photo[]>([]);

    // Track per-album orientation for optimistic rotate
    const [orientations, setOrientations] = useState<Record<string, number>>({});
    const [isEditing, setIsEditing] = useState(false);

    const params = useParams<CollectionRouteParams>();

    const loadAlbums = (includeDeleted: boolean) => {
        fetchAlbums(params.collection!, includeDeleted)
            .then(data => {
                setPhotos(data);
                const savedOrientations: Record<string, number> = {};
                for (const p of data) {
                    if (p.orientation) savedOrientations[p.album] = p.orientation;
                }
                setOrientations(savedOrientations);
                setEmptyMessage(data.length === 0 ? 'No albums found in this collection.' : null);
                setisLoading(false);
            })
            .catch(error => {
                console.error(error);
                if (error?.response?.status === 404) {
                    setEmptyMessage('No albums found in this collection.');
                } else {
                    setEmptyMessage('Failed to load albums. Please try again later.');
                }
                setPhotos([]);
                setisLoading(false);
            });
    };

    useEffect(() => { loadAlbums(isEditing); }, [params.collection]);

    // Re-fetch: include deleted in edit mode, exclude when leaving
    useEffect(() => { loadAlbums(isEditing); }, [isEditing]);

    const handleRename = async (album: string, newName: string) => {
        if (!token || !params.collection) return;
        await renameAlbum(params.collection, album, newName, token);
        navigate(`/${params.collection}/${newName}`);
    };

    const handleDelete = async (album: string) => {
        if (!token || !params.collection) return;
        const result = await softDeleteAlbum(params.collection, album, token);
        // If all albums are now deleted the collection itself was soft-deleted.
        if (result.collectionDeleted) {
            navigate('/');
            return;
        }
        // Optimistically mark as deleted instead of removing
        setPhotos(prev => prev.map(p => p.album === album ? { ...p, isDeleted: true } : p));
    };

    const handleRestore = async (album: string) => {
        if (!token || !params.collection) return;
        await restoreAlbum(params.collection, album, token);
        // Optimistically mark as not deleted
        setPhotos(prev => prev.map(p => p.album === album ? { ...p, isDeleted: false } : p));
    };

    const handleRotateThumbnail = async (album: string) => {
        if (!token || !params.collection) return;
        const current = orientations[album] ?? 0;
        const next = (current + 90) % 360;
        setOrientations(prev => ({ ...prev, [album]: next }));
        await updateAlbumThumbnail(params.collection, album, { orientation: next }, token);
    };

    const handleOpenThumbnailPicker = async (album: string) => {
        if (!params.collection) return;
        setPickerAlbum(album);
        try {
            const allPhotos = await fetchPhotos(params.collection, album);
            setPickerPhotos(allPhotos);
        } catch (err) {
            console.error('Failed to load photos for thumbnail picker', err);
            setPickerAlbum(null);
        }
    };

    const handleSelectThumbnail = async (imageName: string) => {
        if (!token || !params.collection || !pickerAlbum) return;
        await updateAlbumThumbnail(params.collection, pickerAlbum, { imageName }, token);
        setPickerAlbum(null);
        setPickerPhotos([]);
        loadAlbums(isEditing);
    };

    return (
        <div>
            <Box sx={{ width: "90%", mx: "auto" }} className="">
                <Breadcrumb segments={[
                    { label: 'Collections', to: '/' },
                    { label: params.collection! },
                ]} />
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
                    key={`album-${params.collection}`}
                    targetRowHeight={200}
                    rowConstraints={{ singleRowMaxHeight: 250 }}
                    render={{
                        photo: ({ onClick }, { photo, index }) => (
                            <div className="p-1 pt-4" key={`album-${photo.album}-${index}`} onClick={onClick}>
                                <Link to={photo.isDeleted ? '#' : photo.album} onClick={photo.isDeleted ? (e) => e.preventDefault() : undefined}>
                                    <div className={`overflow-hidden rounded-sm max-h-56 relative transition-all ${photo.isDeleted ? 'border-2 border-red-500/70 opacity-50' : ''}`}>
                                        <LazyImage
                                            src={photo.src}
                                            key={index}
                                            placeholderWidth={photo.width}
                                            placeholderHeight={photo.height}
                                            className="hover:opacity-85 w-full h-full object-cover"
                                            style={{
                                                transform: orientations[photo.album]
                                                    ? `rotate(${orientations[photo.album]}deg) scale(1.4)`
                                                    : undefined,
                                                transition: 'transform 0.3s ease',
                                            }}
                                        />
                                        {photo.isDeleted && (
                                            <div className="absolute inset-0 bg-red-900/30 flex items-center justify-center pointer-events-none rounded-sm">
                                                <span className="text-red-200 font-bold text-xs uppercase tracking-widest bg-red-900/60 px-2 py-0.5 rounded">Deleted</span>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                                <div className="flex items-center justify-between">
                                    <Link to={photo.isDeleted ? '#' : photo.album} onClick={photo.isDeleted ? (e) => e.preventDefault() : undefined} className={`uppercase text-sm underline ${photo.isDeleted ? 'line-through opacity-50' : ''} ${theme === 'dark' ? 'text-blue-500' : 'text-blue-700'}`}>{photo.album}</Link>
                                </div>
                                <AdminControls
                                    name={photo.album}
                                    onRename={(newName) => handleRename(photo.album, newName)}
                                    onDelete={() => handleDelete(photo.album)}
                                    onRotateThumbnail={() => handleRotateThumbnail(photo.album)}
                                    onChangeThumbnail={() => handleOpenThumbnailPicker(photo.album)}
                                    visible={isAuthenticated && isEditing}
                                    isDeleted={photo.isDeleted}
                                    onUndelete={() => handleRestore(photo.album)}
                                />
                            </div>
                        ),
                    }}
                />
            </Box>

            {pickerAlbum && pickerPhotos.length > 0 && (
                <ThumbnailPicker
                    title={`Choose thumbnail for "${pickerAlbum}"`}
                    photos={pickerPhotos}
                    onSelect={handleSelectThumbnail}
                    onClose={() => { setPickerAlbum(null); setPickerPhotos([]); }}
                />
            )}
        </div>
    );
};

export default Albums;