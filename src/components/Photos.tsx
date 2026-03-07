/**
 * Photos — The most complex component in the app. Displays photos for a
 * given collection/album in either browse mode (RowsPhotoAlbum with
 * lightbox) or edit mode (CSS grid of editable cards).
 *
 * Complexity:
 *  - Two rendering modes toggled by isEditMode.
 *  - Edit mode cards include inline description editing, collection/album
 *    reassignment via TagSelector, thumbnail radio selection (MultiRadio),
 *    image rotation, deletion, and optional EXIF data display.
 *  - Tracks per-photo dirty state against originalPhotosRef to build a
 *    minimal diff for the save operation.
 *  - Save sends bulk tag updates (collection, album, description, delete,
 *    thumbnail flags) and rotation patches via FileUploadService.
 */
import React, { useState, useEffect, useRef, Fragment } from 'react';
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
import { FaArrowRotateRight, FaArrowRotateLeft } from "react-icons/fa6";
import PhotoExifData from './PhotoExifData.tsx';
import MultiRadio from './MultiRadio.tsx';
import FileUploadService from '../services/FileUploadService';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../hooks/useAuth';
import { fetchPhotos, fetchTags } from '../services/photoService';
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
    const [collection, setCollection] = useState('');
    const [album, setAlbum] = useState('');
    const [collectionImage, setCollectionImage] = useState('');
    const [collectionExists, setCollectionExists] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const [validationMessage, setValidationMessage] = useState('');
    const [albumImage, setAlbumImage] = useState('');
    const { theme } = useTheme();
    const [showExif, setShowExif] = useState(false);
    const [isLoading, setisLoading] = useState(true);
    const originalPhotosRef = useRef<Photo[]>([]);

    const params = useParams<PhotoRouteParams>();

    useEffect(() => {
        setIsAdmin(true);
    }, [isAuthenticated]);

    const handleShowExif = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShowExif(event.target.checked);
    }

    const handleAlbumThumbnail = (imageName: string) => {
        setAlbumImage(imageName);

        let photo = photos.filter((photo => photo.name.includes(imageName)));

        setPhotos((prevState) => {
            return prevState.map((photo) => photo.name === imageName ? {
                ...photo, albumImage: true
            } : photo)
        });

        setPhotos((prevState) => {
            return prevState.map((photo) => photo.name != imageName ? {
                ...photo, albumImage: false
            } : photo)
        });
    }

    const handleCollectionThumbnail = (imageName: string) => {
        setCollectionImage(imageName);

        let photo = photos.filter((photo => photo.name.includes(imageName)));
        setPhotos((prevState) => {
            return prevState.map((photo) => photo.name === imageName ? {
                ...photo, collectionImage: true
            } : photo)
        });

        setPhotos((prevState) => {
            return prevState.map((photo) => photo.name != imageName ? {
                ...photo, collectionImage: false
            } : photo)
        });
    }

    async function isFormValid() {
        if (collection === "" && !collectionExists) {
            let msg = "collection is not set";
            setIsValid(false);
            setValidationMessage(msg);
        } else if (album === "") {
            let msg = "album is not set";
            setIsValid(false);
            setValidationMessage(msg);
        } else if (collectionImage === "" && !collectionExists) {
            let msg = "collection image thumbnail is not set";
            setIsValid(false);
            setValidationMessage(msg);
        } else {
            setIsValid(true);
            setValidationMessage("");
        }
    }

    async function checkCollectionExists(collection: string) {
        const data = await fetchTags()

        for (const [c, a] of Object.entries(data)) {
            if (c === collection) {
                // collection already exists, so we don't require the collectionImage
                setCollectionExists(true);
            }
        }
    }

    const onChangeCollection = (collection: string, id: string) => {
        checkCollectionExists(collection);
        setCollection(collection);
        setPhotos((prevState) => {
            return prevState.map((photo) => photo.name === id ? {
                ...photo, collection: collection
            } : photo)
        });
    }

    const onChangeAlbum = (album: string, id: string) => {
        setAlbum(album);
        setPhotos((prevState) => {
            return prevState.map((photo) => photo.name === id ? {
                ...photo, album: album
            } : photo)
        });
    }

    useEffect(() => {
        fetchPhotos(params.collection!, params.album!)
            .then(data => {
                setPhotos(data);
                setisLoading(false);
            })
            .catch(error => {
                console.error(error);
            });
    }, [params.collection, params.album]);

    const setEditMode = () => {
        if (!isEditMode) {
            originalPhotosRef.current = photos.map(p => ({ ...p }));
        }
        setIsEditMode(!isEditMode);
    }

    const onChangeIsDeleted = (event: React.ChangeEvent<HTMLInputElement>) => {

        let photo = photos.filter((photo => photo.name.includes(event.target.id)));
        setPhotos((prevState) => {
            return prevState.map((photo) => photo.name === event.target.id ? {
                ...photo, isDeleted: !photo.isDeleted
            } : photo)
        });
    }

    const onChangeDescription = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();

        let photo = photos.filter((photo => photo.name.includes(event.target.id)));
        setPhotos((prevState) => {
            return prevState.map((photo) => photo.name === event.target.id ? {
                ...photo, description: event.target.value
            } : photo)
        });
    }

    const handleImageOrientation = (event: React.MouseEvent<HTMLDivElement>, direction: string) => {
        const targetId = event.currentTarget.id;
        const lower_limit = 0;
        const upper_limit = 360;
        const step = 90;
        const rotate = [0, 90, 180, 270];

        let photo = photos.filter((photo => photo.name.includes(targetId)));
        let orientation = photo[0].orientation;
        let pos = rotate.indexOf(orientation);
        orientation = rotate[++pos % 4];

        setPhotos((prevState) => {
            return prevState.map((photo) => photo.name === targetId ? {
                ...photo, orientation: orientation
            } : photo)
        });
    }

    function saveEditedData(data: Photo[]) {
        if (!isAuthenticated || !token) {
            console.error("this action requires authentication");
            return;
        }

        // Only send photos that have actually changed
        const changedPhotos = data.filter(photo => {
            const original = originalPhotosRef.current.find(o => o.name === photo.name);
            if (!original) return true;
            return (
                photo.description !== original.description ||
                photo.collection !== original.collection ||
                photo.album !== original.album ||
                photo.orientation !== original.orientation ||
                photo.isDeleted !== original.isDeleted ||
                photo.collectionImage !== original.collectionImage ||
                photo.albumImage !== original.albumImage
            );
        });

        for (let i = 0; i < changedPhotos.length; i++) {
            FileUploadService.update(changedPhotos[i], token)
                .then((response) => {
                }).catch((error) => {
                    console.error("error updating photo data: " + error);
                });
        }

        setIsEditMode(false);
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
                            {
                                isEditMode && (
                                    <button
                                        className={`h-8 text-md font-semibold w-24 rounded-md ${theme === 'dark' ? 'hover:bg-gray-100 bg-gray-300 text-gray-600' : 'hover:bg-gray-400 bg-gray-500 text-gray-100'} ${!isValid ? 'active:animate-none' : 'active:animate-pop'}`}
                                        onClick={() => saveEditedData(photos)}
                                    >
                                        Save
                                    </button>
                                )
                            }
                            <button
                                className={`h-8 text-md font-semibold w-24 rounded-md ${theme === 'dark' ? 'hover:bg-gray-100 bg-gray-300 text-gray-600' : 'hover:bg-gray-400 bg-gray-500 text-gray-100'} ${!isValid ? 'active:animate-none' : 'active:animate-pop'}`}
                                onClick={setEditMode}
                            >
                                {isEditMode ? "Cancel" : "Edit"}
                            </button>
                        </div>
                    )
                }
                <LoadingSpinner visible={isLoading} />
                {isEditMode ? (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 pb-8 pt-4">
                        {photos.map((photo, idx) => (
                            <div className="flex flex-col overflow-visible border-1 border-gray-600 shadow-md shadow-black/60 rounded-sm" key={`photo-edit-${photo.id}-${idx}`}>
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
                                    {(isAdmin && isAuthenticated) && (
                                        <div id={photo.name} className="absolute top-2 left-2 z-10 text-neutral-400 bg-orange-900 p-1 hover:border-[1px] rounded-xl hover:bg-orange-400 hover:text-white" onClick={(e) => handleImageOrientation(e, 'cw')}>
                                            <FaArrowRotateRight className="cursor-grab rounded-xl" id={photo.name} />
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
                                            isFormValid={isFormValid}
                                        />
                                        <div className='flex items-center gap-2'>
                                            <label className="text-xs font-semibold uppercase tracking-wide opacity-70">Delete</label>
                                            <input
                                                type='checkbox'
                                                name='isDeleted'
                                                className={`rounded accent-red-500 cursor-pointer`}
                                                checked={photo.isDeleted}
                                                id={photo.name}
                                                onChange={(event) => onChangeIsDeleted(event)}
                                                disabled={photo.collectionImage || photo.albumImage}
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            {
                                                collectionExists ?
                                                    <></>
                                                    :
                                                    <MultiRadio
                                                        groupName="Collection"
                                                        imageName={`${photo.name}`}
                                                        handler={handleCollectionThumbnail}
                                                        checked={photo.collectionImage}
                                                    />
                                            }
                                            <MultiRadio
                                                groupName="Album"
                                                imageName={`${photo.name}`}
                                                handler={handleAlbumThumbnail}
                                                checked={photo.albumImage}
                                            />
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