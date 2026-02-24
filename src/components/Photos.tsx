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
            //console.log(msg)
            setIsValid(false);
            setValidationMessage(msg);
        } else if (album === "") {
            let msg = "album is not set";
            //console.log(msg)
            setIsValid(false);
            setValidationMessage(msg);
        } else if (collectionImage === "" && !collectionExists) {
            let msg = "collection image thumbnail is not set";
            //console.log(msg)
            setIsValid(false);
            setValidationMessage(msg);
        } else {
            //console.log("form is valid")
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
        //console.log("collection: " + collection)
        //console.log("id: " + id)
        checkCollectionExists(collection);
        setCollection(collection);
        //console.log("collection: " + collection)
    }

    const onChangeAlbum = (album: string, id: string) => {
        setAlbum(album);
        //console.log("album " + album)
        //console.log("id: " + id)
    }

    useEffect(() => {
        fetchPhotos(params.collection!, params.album!)
            .then(data => {
                //console.log("response: " + JSON.stringify(data));
                setPhotos(data);
                setisLoading(false);
            })
            .catch(error => {
                console.error(error);
            });
    }, [params.collection, params.album]);

    const setEditMode = () => {
        if (!isEditMode) {
            // Snapshot current state when entering edit mode
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

    const handleImageOrientation = (event: React.MouseEvent<SVGElement>, direction: string) => {
        const targetId = event.currentTarget.id;
        console.log("id: " + JSON.stringify(targetId))

        const lower_limit = 0;
        const upper_limit = 360;
        const step = 90;
        const rotate = [0, 90, 180, 270];

        let photo = photos.filter((photo => photo.name.includes(targetId)));
        let orientation = photo[0].orientation;
        //orientation = (orientation + step) % upper_limit;
        let pos = rotate.indexOf(orientation);
        console.log("pos: " + pos)


        orientation = rotate[++pos % 4];

        console.log("orientation: " + orientation)
        console.log("width: " + photo[0].width)

        setPhotos((prevState) => {
            return prevState.map((photo) => photo.name === targetId ? {
                ...photo, orientation: orientation
            } : photo)
        });
    }

    function saveEditedData(data: Photo[]) {
        console.log("saving edited data")

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
                    //console.log("response: " + JSON.stringify(response));
                }).catch((error) => {
                    console.error("error updating photo data: " + error);
                });
        }

        setIsEditMode(false);
    }

    return (
        <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-300'}`}>
            <Box sx={{ width: "90%", mx: "auto", p: 2 }}>
                <Breadcrumb segments={[
                    { label: 'Collections', to: '/' },
                    { label: params.collection!, to: `/${params.collection}` },
                    { label: params.album! },
                ]} />
                {
                    (isAuthenticated && isAdmin && !isLoading) && (
                        <div className='inline justify-end float-right pr-2'>
                            {
                                isEditMode && (<button className={`text-white h-8 text-md mt-1 mr-2 ${theme === 'dark' ? 'hover:bg-gray-100 bg-gray-300 text-gray-600' : 'hover:bg-gray-400 bg-gray-500 text-gray-100'} ${!isValid ? 'active:animate-none' : 'active:animate-pop'} p-0 w-32 pl-2 pr-2 font-semibold text-md rounded-md`} onClick={() => saveEditedData(photos)}>
                                    {
                                        "Save"
                                    }
                                </button>)
                            }
                            <button className={`text-white h-8 text-md mt-0 ${theme === 'dark' ? 'hover:bg-gray-100 bg-gray-300 text-gray-600' : 'hover:bg-gray-400 bg-gray-500 text-gray-100'} ${!isValid ? 'active:animate-none' : 'active:animate-pop'} p-0 w-32 pl-2 pr-2 font-semibold text-md rounded-md`} onClick={setEditMode}>
                                {
                                    isEditMode ? "Cancel" : "Edit"
                                }
                            </button>
                            {
                                isEditMode && (
                                    <>
                                        <label className={`uppercase text-sm ml-2 mr-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-500'} uppercase`}>Show Exif</label>
                                        <input type="checkbox"
                                            onChange={(event) => { handleShowExif(event) }}
                                        >
                                        </input>
                                    </>
                                )
                            }
                        </div>
                    )
                }
                <LoadingSpinner visible={isLoading} />
                <RowsPhotoAlbum
                    padding={30}
                    spacing={0}
                    photos={photos}
                    rowConstraints={{ singleRowMaxHeight: 200, minPhotos: 1, maxPhotos: 10 }}
                    targetRowHeight={100}
                    key={`album_rows-${index}`}
                    onClick={({ index }) => setIndex(index)} // open in LightBox
                    render={{
                        photo: ({ onClick }, { photo }) => (
                            <div className="grid group justify-center object-fill p-1" key={photo.id}>
                                <img
                                    alt={photo.description}
                                    src={photo.src}
                                    key={`img-${index}`}
                                    className={`hover:opacity-85 hover:cursor-pointer [grid-column:1] [grid-row:1] rounded-sm  max-h-[300px]  animate-appear object-fill ${photo.orientation === 270 ? '-rotate-90' : `rotate-[${photo.orientation}deg]`}`}
                                    onClick={onClick}
                                />
                                {(isAdmin && isEditMode && isAuthenticated) && (
                                    <div id={photo.name} className={`[grid-column:1] z-0 [grid-row:1] place-self-start text-white bg-gray-500 m-1 p-1 rounded-md overflow-hidden`}>
                                        <FaArrowRotateRight id={photo.name} onClick={(e) => handleImageOrientation(e, 'cw')} />
                                    </div>
                                )
                                }
                                <div className={`[grid-column:1] [grid-row:1] place-self-end block ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-500'}  ${isAuthenticated} ? : group-hover:opacity-60 opacity-0 text-white overflow-hidden w-full`}>{photo.description}</div>
                                {
                                    (isEditMode && isAdmin) && (
                                        <div className={` flex ${theme === 'dark' ? 'bg-gray-700 text-white border-b-gray-600 border-l-gray-600 border-r-gray-600' : 'bg-gray-100 text-gray-700 border-b-gray-300 border-l-gray-300 border-r-gray-300'} flex-col text-left pr-2 pl-2 pb-2 pt-2  border-l-2 border-r-2 border-b-2 rounded-b-lg`}>
                                            <label>Description</label>
                                            <input
                                                type="text"
                                                name='description'
                                                className={`pl-2 rounded-md h-8 ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-300 text-gray-700'} `}
                                                value={photo.description}
                                                id={photo.name}
                                                onChange={(event) => onChangeDescription(event)}
                                            />
                                            <TagSelector
                                                mode="edit"
                                                id={photo.name}
                                                collection={photo.collection}
                                                album={photo.album}
                                                selectedAlbum={(event: string) => onChangeAlbum(event, photo.name)}
                                                selectedCollection={(event: string) => onChangeCollection(event, photo.name)}
                                                isFormValid={isFormValid}
                                            />
                                            <div className=''>
                                                <label>Delete {photo.isDeleted}</label>
                                                <input
                                                    type='checkbox'
                                                    name='isDeleted'
                                                    className='block'
                                                    checked={photo.isDeleted}
                                                    id={photo.name}
                                                    onChange={(event) => onChangeIsDeleted(event)}
                                                    disabled={photo.collectionImage || photo.albumImage}
                                                />
                                            </div>
                                            <div className="col-span-2">
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
                                    )
                                }
                            </div>
                        ),
                    }}
                />
                <Outlet />
            </Box>
            <Lightbox
                slides={photos}
                open={index >= 0}
                index={index}
                close={() => setIndex(-1)}
                plugins={[Fullscreen, Slideshow, Thumbnails]}
            />
        </div>
    )
};

export default Photos;