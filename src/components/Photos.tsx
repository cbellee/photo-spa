/**
 * Photos — Displays photos for a given collection/album in either browse
 * mode (RowsPhotoAlbum with lightbox) or edit mode (CSS grid of editable
 * cards).
 *
 * Edit mode cards support inline description editing, collection/album
 * reassignment via TagSelector, image rotation, soft-deletion, and
 * optional EXIF data display. All changes auto-save immediately
 * (description is debounced). Soft-deleted photos remain visible with a
 * visual "Deleted" overlay so the user can re-enable them.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, Outlet } from 'react-router-dom';
import Box from "@mui/material/Box";
import { RowsPhotoAlbum } from 'react-photo-album';
import "react-photo-album/rows.css";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import TagSelector from './TagSelector';
import { FaArrowRotateRight, FaTrashCan } from "react-icons/fa6";
import PhotoExifData from './PhotoExifData.tsx';
import FileUploadService from '../services/FileUploadService';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../hooks/useAuth';
import { fetchPhotos } from '../services/photoService';
import type { Photo, PhotoRouteParams } from '../types';
import LoadingSpinner from './LoadingSpinner';
import Breadcrumb from './Breadcrumb';
import LazyImage from './LazyImage';

interface PhotoProps {
    collection: string;
    album: string;
}

const Photos: React.FC<PhotoProps> = () => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [index, setIndex] = useState<number>(-1);
    const { isAuthenticated, token } = useAuth();
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const { theme } = useTheme();
    const [showExif, setShowExif] = useState(false);
    const [isLoading, setisLoading] = useState(true);
    const photosRef = useRef<Photo[]>([]);
    const descriptionTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    const params = useParams<PhotoRouteParams>();

    useEffect(() => {
        setIsAdmin(true);
    }, [isAuthenticated]);

    useEffect(() => {
        photosRef.current = photos;
    }, [photos]);

    useEffect(() => {
        return () => {
            Object.values(descriptionTimers.current).forEach(clearTimeout);
        };
    }, []);

    const handleShowExif = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShowExif(event.target.checked);
    }

    const autoSavePhoto = (photo: Photo) => {
        if (!isAuthenticated || !token) {
            console.error("this action requires authentication");
            return;
        }
        FileUploadService.update(photo, token)
            .catch((error) => {
                console.error("error auto-saving photo: " + error);
            });
    };

    const onChangeCollection = (newCollection: string, id: string) => {
        const current = photos.find(p => p.name === id);
        if (!current) return;
        const updated = { ...current, collection: newCollection };
        setPhotos(prev => prev.map(p => p.name === id ? updated : p));
        autoSavePhoto(updated);
    }

    const onChangeAlbum = (newAlbum: string, id: string) => {
        const current = photos.find(p => p.name === id);
        if (!current) return;
        const updated = { ...current, album: newAlbum };
        setPhotos(prev => prev.map(p => p.name === id ? updated : p));
        autoSavePhoto(updated);
    }

    const loadPhotos = (includeDeleted: boolean) => {
        setisLoading(true);
        fetchPhotos(params.collection!, params.album!, includeDeleted)
            .then(data => {
                setPhotos(data);
                setisLoading(false);
            })
            .catch(error => {
                console.error(error);
                setisLoading(false);
            });
    };

    useEffect(() => {
        loadPhotos(false);
    }, [params.collection, params.album]);

    const setEditMode = () => {
        const entering = !isEditMode;
        setIsEditMode(entering);
        // Re-fetch: include deleted in edit mode, exclude when leaving
        loadPhotos(entering);
    }

    const onChangeIsDeleted = (photoName: string) => {
        const current = photos.find(p => p.name === photoName);
        if (!current) return;
        const updated = { ...current, isDeleted: !current.isDeleted };
        setPhotos(prev => prev.map(p => p.name === photoName ? updated : p));
        autoSavePhoto(updated);
    }

    const onChangeDescription = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = event.target;
        setPhotos(prev => prev.map(p => p.name === id ? { ...p, description: value } : p));

        if (descriptionTimers.current[id]) {
            clearTimeout(descriptionTimers.current[id]);
        }
        descriptionTimers.current[id] = setTimeout(() => {
            const latest = photosRef.current.find(p => p.name === id);
            if (latest) autoSavePhoto(latest);
        }, 800);
    }

    const handleImageOrientation = (event: React.MouseEvent<HTMLDivElement>, direction: string) => {
        const targetId = event.currentTarget.id;
        const rotate = [0, 90, 180, 270];

        const current = photos.find(p => p.name === targetId);
        if (!current) return;
        const pos = rotate.indexOf(current.orientation);
        const newOrientation = rotate[(pos + 1) % 4];
        const updated = { ...current, orientation: newOrientation };

        setPhotos(prev => prev.map(p => p.name === targetId ? updated : p));
        autoSavePhoto(updated);
    }

    return (
        <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-300'}`}>
            <Box className='w-[90%] mx-auto box-border'>
                <Breadcrumb segments={[
                    { label: 'Collections', to: '/' },
                    { label: params.collection!, to: `/${params.collection}` },
                    { label: params.album! },
                ]} />
                {
                    (isAuthenticated && isAdmin && !isLoading) && (
                        <div className={`flex flex-wrap gap-x-4 gap-y-3 px-4 py-3 items-center rounded-md ${theme === 'dark' ? 'bg-gray-800/60 text-gray-200 border border-gray-700' : 'bg-white/80 text-gray-600 border border-gray-200 shadow-sm'}`}>
                            {
                                isEditMode && (
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <span className="text-xs font-semibold uppercase tracking-wide opacity-70">Show Exif</span>
                                        <input type="checkbox"
                                            className="accent-orange-500 cursor-pointer"
                                            onChange={(event) => { handleShowExif(event) }}
                                        />
                                    </label>
                                )
                            }
                            <div className="flex-1" />
                            <button
                                className={`h-8 text-md font-semibold w-24 rounded-md ${theme === 'dark' ? 'hover:bg-gray-100 bg-gray-300 text-gray-600' : 'hover:bg-gray-400 bg-gray-500 text-gray-100'} active:animate-pop`}
                                onClick={setEditMode}
                            >
                                {isEditMode ? "Done" : "Edit"}
                            </button>
                        </div>
                    )
                }
                <LoadingSpinner visible={isLoading} />
                {isEditMode ? (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 pb-8 pt-4">
                        {photos.map((photo, idx) => (
                            <div className={`flex flex-col overflow-visible shadow-md shadow-black/60 rounded-sm transition-all ${photo.isDeleted ? 'border-2 border-red-500/70 opacity-50' : 'border border-gray-600'}`} key={`photo-edit-${photo.id}-${idx}`}>
                                <div className="relative h-[200px] w-full bg-slate-800 rounded-t-md rounded-l-md rounded-r-md rounded-bl-none overflow-hidden">
                                    <LazyImage
                                        alt={photo.description}
                                        src={photo.src}
                                        wrapperClassName="absolute inset-0"
                                        className="hover:opacity-85 hover:cursor-pointer w-full h-full p-2 object-scale-down "
                                        style={{
                                            transform: photo.orientation ? `rotate(${photo.orientation}deg)` : undefined,
                                        }}
                                        onClick={() => setIndex(idx)}
                                    />
                                    {photo.isDeleted && (
                                        <div className="absolute inset-0 bg-red-900/30 flex items-center justify-center pointer-events-none rounded-t-md">
                                            <span className="text-red-200 font-bold text-xs uppercase tracking-widest bg-red-900/60 px-2 py-0.5 rounded">Deleted</span>
                                        </div>
                                    )}
                                </div>
                                {isAdmin && (
                                    <div className={`flex ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-600'} rounded-b-md flex-col gap-3 text-left p-2`}>
                                        <div>
                                            <label className="text-xs font-semibold uppercase tracking-wide opacity-70">Description</label>
                                            <input
                                                type="text"
                                                name='description'
                                                className={`w-full px-1.5 py-1.5 rounded-sm text-sm border ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-500 focus:border-blue-400' : 'bg-white text-gray-800 border-gray-300 focus:border-blue-500'} outline-none transition-colors`}
                                                value={photo.description}
                                                id={photo.name}
                                                onChange={(event) => onChangeDescription(event)}
                                            />
                                        </div>
                                        <TagSelector
                                            mode="edit"
                                            id={photo.name}
                                            collection={photo.collection}
                                            album={photo.album}
                                            selectedAlbum={(event: string) => onChangeAlbum(event, photo.name)}
                                            selectedCollection={(event: string) => onChangeCollection(event, photo.name)}
                                            isFormValid={() => {}}
                                        />
                                        <div className='flex items-center gap-2'>
                                            <button
                                                type='button'
                                                className={`p-1.5 rounded-md transition-colors cursor-pointer ${photo.isDeleted ? 'text-red-500' : theme === 'dark' ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'} ${(photo.collectionImage || photo.albumImage) ? 'opacity-30 pointer-events-none' : ''}`}
                                                onClick={() => onChangeIsDeleted(photo.name)}
                                                title={photo.isDeleted ? 'Unmark for deletion' : 'Mark for deletion'}
                                            >
                                                <FaTrashCan size={16} />
                                            </button>
                                            <button
                                                type='button'
                                                id={photo.name}
                                                className={`p-1.5 rounded-md transition-colors cursor-pointer ${theme === 'dark' ? 'text-gray-400 hover:text-orange-400' : 'text-gray-500 hover:text-orange-500'}`}
                                                onClick={(e) => handleImageOrientation(e as unknown as React.MouseEvent<HTMLDivElement>, 'cw')}
                                                title='Rotate image'
                                            >
                                                <FaArrowRotateRight size={16} />
                                            </button>
                                        </div>
                                        {
                                            showExif &&
                                            <PhotoExifData data={photo.exifData} />
                                        }
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="pt-4">
                    <RowsPhotoAlbum
                        padding={0}
                        spacing={5}
                        photos={photos}
                        rowConstraints={{ singleRowMaxHeight: 200, minPhotos: 1, maxPhotos: 10 }}
                        targetRowHeight={200}
                        key={`album_rows-${index}`}
                        onClick={({ index }) => setIndex(index)}
                        render={{
                            photo: ({ onClick }, { photo, index, width, height }) => (
                                <div className="grid group justify-center overflow-hidden" key={`photo-${photo.id}-${index}`} style={{ width, height }}>
                                    <LazyImage
                                        alt={photo.description}
                                        src={photo.src}
                                        placeholderWidth={photo.width}
                                        placeholderHeight={photo.height}
                                        wrapperClassName="[grid-column:1] [grid-row:1]"
                                        className="hover:opacity-85 hover:cursor-pointer w-full h-full object-cover"
                                        style={{
                                            transform: `rotate(${photo.orientation}deg)${photo.orientation === 90 || photo.orientation === 270
                                                ? ` scale(${Math.min(photo.width * 2, photo.height) / Math.max(photo.width, photo.height)})`
                                                : ''
                                                }`,
                                        }}
                                        onClick={onClick}
                                    />
                                    <div className={`[grid-column:1] [grid-row:1] place-self-end block ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-500'} ${isAuthenticated ? 'group-hover:opacity-60 opacity-0' : 'opacity-0'} text-white overflow-hidden w-full`}>{photo.description}</div>
                                </div>
                            ),
                        }}
                    />
                    </div>
                )}
                <Outlet />
            </Box>
            <Lightbox
                slides={photos}
                open={index >= 0}
                index={index}
                close={() => setIndex(-1)}
                plugins={[Fullscreen, Slideshow, Thumbnails]}
                render={{
                    slide: ({ slide }) => {
                        const photo = slide as Photo;
                        return (
                            <img
                                src={photo.src}
                                alt={photo.description}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                    transform: photo.orientation ? `rotate(${photo.orientation}deg)` : undefined,
                                }}
                            />
                        );
                    },
                    thumbnail: ({ slide }) => {
                        const photo = slide as Photo;
                        return (
                            <img
                                src={photo.src}
                                alt={photo.description}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transform: photo.orientation ? `rotate(${photo.orientation}deg)` : undefined,
                                }}
                            />
                        );
                    },
                }}
            />
        </div>
    )
};

export default Photos;