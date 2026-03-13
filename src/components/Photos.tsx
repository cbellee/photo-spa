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
        // Only show spinner on first load, not re-fetches (avoids flash when closing lightbox)
        if (photos.length === 0) {
            setisLoading(true);
        }
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
        loadPhotos(isAuthenticated);
    }, [params.collection, params.album, isAuthenticated]);

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
        <div className="animate-appear">
                <Breadcrumb segments={[
                    { label: 'Collections', to: '/' },
                    { label: params.collection!, to: `/${params.collection}` },
                    { label: params.album! },
                ]} />
                {
                    (isAuthenticated && isAdmin && !isLoading) && (
                        <div className={`flex flex-wrap gap-x-4 gap-y-3 px-4 py-3 mb-6 items-center rounded-md ${theme === 'dark' ? 'bg-surface-card text-gray-200 border border-surface-border' : 'bg-surface-light-card text-gray-600 border border-surface-light-border shadow-card-light'}`}>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <span className="text-xs font-semibold tracking-wide opacity-70">Show Exif</span>
                                <input type="checkbox"
                                    className="accent-accent cursor-pointer"
                                    onChange={(event) => { handleShowExif(event) }}
                                />
                            </label>
                        </div>
                    )
                }
                <LoadingSpinner visible={isLoading} />
                {(isAuthenticated && isAdmin) ? (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5 pb-8">
                        {photos.map((photo, idx) => (
                            <div className={`flex flex-col overflow-visible rounded-md transition-all duration-300 ${photo.isDeleted ? 'border-2 border-red-500/70 opacity-50' : ''} ${
                                theme === 'dark'
                                    ? 'bg-surface-card border border-surface-border shadow-card hover:shadow-card-hover'
                                    : 'bg-surface-light-card border border-surface-light-border shadow-card-light hover:shadow-card-light-hover'
                            }`} key={`photo-edit-${photo.id}-${idx}`}>
                                <div className={`relative h-[200px] w-full rounded-t-md overflow-hidden ${theme === 'dark' ? 'bg-surface' : 'bg-gray-50'}`}>
                                    <LazyImage
                                        alt={photo.description}
                                        src={photo.src}
                                        wrapperClassName="absolute inset-0 flex items-center justify-center"
                                        className="hover:opacity-85 hover:cursor-pointer w-full h-full object-cover transition-transform duration-300"
                                        style={{
                                            transform: photo.orientation
                                                ? `rotate(${photo.orientation}deg)${photo.orientation === 90 || photo.orientation === 270 ? ' scale(1.35)' : ''}`
                                                : undefined,
                                        }}
                                        onClick={() => setIndex(idx)}
                                    />
                                    {photo.isDeleted && (
                                        <div className="absolute inset-0 bg-red-900/30 flex items-center justify-center pointer-events-none rounded-t-md">
                                            <span className="text-red-200 font-bold text-xs uppercase tracking-widest bg-red-900/60 px-2 py-0.5 rounded-md">Deleted</span>
                                        </div>
                                    )}
                                </div>
                                {isAdmin && (
                                    <div className={`flex rounded-b-md flex-col gap-3 text-left p-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`}>
                                        <div>
                                            <label className="text-xs font-semibold tracking-wide opacity-70">Description</label>
                                            <input
                                                type="text"
                                                name='description'
                                                className={`w-full px-2 py-1.5 rounded-md text-sm border ${theme === 'dark' ? 'bg-surface text-white border-surface-border focus:border-accent' : 'bg-gray-50 text-gray-800 border-surface-light-border focus:border-accent'} outline-none transition-colors`}
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
                                        <div className='flex items-center gap-2 pt-1'>
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
                                                className={`p-1.5 rounded-md transition-colors cursor-pointer ${theme === 'dark' ? 'text-gray-400 hover:text-accent-light' : 'text-gray-500 hover:text-accent'}`}
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
                    <div>
                    <RowsPhotoAlbum
                        padding={0}
                        spacing={6}
                        photos={photos}
                        rowConstraints={{ singleRowMaxHeight: 200, minPhotos: 1, maxPhotos: 10 }}
                        targetRowHeight={200}
                        key={`album_rows-${index}`}
                        onClick={({ index }) => setIndex(index)}
                        render={{
                            photo: ({ onClick }, { photo, index, width, height }) => (
                                <div className="group justify-center overflow-hidden rounded-sm" key={`photo-${photo.id}-${index}`} style={{ width, height }}>
                                    <LazyImage
                                        alt={photo.description}
                                        src={photo.src}
                                        placeholderWidth={photo.width}
                                        placeholderHeight={photo.height}
                                        wrapperClassName="[grid-column:1] [grid-row:1] w-full h-full"
                                        className="hover:cursor-pointer w-full h-full object-cover transition-transform duration-500"
                                        style={{
                                            '--base-transform': `rotate(${photo.orientation}deg)${photo.orientation === 90 || photo.orientation === 270
                                                ? ` scale(${Math.min(photo.width * 2, photo.height) / Math.max(photo.width, photo.height)})`
                                                : ''
                                                }`,
                                            transform: 'var(--base-transform)',
                                        } as React.CSSProperties}
                                        onClick={onClick}
                                    />

                                </div>
                            ),
                        }}
                    />
                    </div>
                )}
                <Outlet />
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