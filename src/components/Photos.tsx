import React, { useState, useEffect, Fragment } from 'react';
import { useParams, Link, Outlet } from 'react-router-dom';
import Box from "@mui/material/Box";
import { apiConfig } from '../config/apiConfig.ts';
import axios from 'axios';
import { useMsal } from "@azure/msal-react";

import { RowsPhotoAlbum } from 'react-photo-album';
import "react-photo-album/rows.css";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { tokenRequest } from '../config/msalConfig.ts';
import TagSelectEdit from './TagSelectEdit.tsx';
import { FaArrowRotateRight } from "react-icons/fa6";
import PhotoExifData from './PhotoExifData.tsx';
import MultiRadio from './MultiRadio.tsx';
import FileUploadService from '../services/FileUploadService';
import { getAccessToken } from '../utils/utils.ts';

interface Photo {
    name: string;
    id: string;
    url: string;
    src: string;
    width: number;
    height: number;
    collection: string;
    albumImage: boolean;
    collectionImage: boolean;
    album: string;
    description: string;
    exifData?: Record<string, string>;
    isDeleted: boolean;
    orientation: number;
}

interface Params extends Record<string, string | undefined> {
    collection: string;
    album: string;
}

interface PhotoProps {
    collection: string;
    album: string;
}

const Photos: React.FC<PhotoProps> = (props) => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [index, setIndex] = useState<number>(-1);
    const msalContext = useMsal();
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const isAuthenticated = msalContext.instance.getAllAccounts().length > 0;
    const [collection, setCollection] = useState('');
    const [album, setAlbum] = useState('');
    const [collectionImage, setCollectionImage] = useState('');
    const [collectionExists, setCollectionExists] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const [validationMessage, setValidationMessage] = useState('');
    const [token, setToken] = useState("");
    const [albumImage, setAlbumImage] = useState('');

    let params = useParams<Params>();
    let instance = msalContext.instance;
    let accounts = msalContext.accounts;

    useEffect(() => {
        getAccessToken(instance, accounts, tokenRequest, setToken);
        setIsAdmin(true);
    }, [isAuthenticated]);

    const handleAlbumThumbnail = (imageName) => {
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

    const handleCollectionThumbnail = (imageName) => {
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

    async function checkCollectionExists(collection) {
        const data = await axios.get(`${apiConfig.photoApiEndpoint}/tags`)

        for (const [c, a] of Object.entries(data.data)) {
            if (c === collection) {
                // collection already exists, so we don't require the collectionImage
                setCollectionExists(true);
            }
        }
    }

    const onChangeCollection = (collection, id) => {
        //console.log("collection: " + collection)
        //console.log("id: " + id)
        checkCollectionExists(collection);
        setCollection(collection);
        //console.log("collection: " + collection)
    }

    const onChangeAlbum = (album, id) => {
        setAlbum(album);
        //console.log("album " + album)
        //console.log("id: " + id)
    }

    useEffect(() => {
        let url = `${apiConfig.photoApiEndpoint}/${params.collection}/${params.album}`;
        axios.get(url)
            .then(response => {
                //console.log("response: " + JSON.stringify(response.data));
                setPhotos(response.data);
            })
            .catch(error => {
                console.error(error);
            });
    }, [props.collection, props.album]);

    const setEditMode = () => {
        setIsEditMode(!isEditMode);
    }

    const onChangeIsDeleted = (event) => {

        let photo = photos.filter((photo => photo.name.includes(event.target.id)));
        setPhotos((prevState) => {
            return prevState.map((photo) => photo.name === event.target.id ? {
                ...photo, isDeleted: !photo.isDeleted
            } : photo)
        });
    }

    const onChangeDescription = (event) => {
        event.preventDefault();

        let photo = photos.filter((photo => photo.name.includes(event.target.id)));
        setPhotos((prevState) => {
            return prevState.map((photo) => photo.name === event.target.id ? {
                ...photo, description: event.target.value
            } : photo)
        });
    }

    const handleImageOrientation = (event) => {
        console.log("id: " + JSON.stringify(event.target.id))

        const lower_limit = 0;
        const upper_limit = 360;
        const step = 90;
        const rotate = [0, 90, 180, -90]

        let photo = photos.filter((photo => photo.name.includes(event.target.id)));
        let orientation = photo[0].orientation;
        orientation = (orientation + step) % upper_limit;

        console.log("orientation: " + orientation)
        console.log("width: " + photo[0].width)

        setPhotos((prevState) => {
            return prevState.map((photo) => photo.name === event.target.id ? {
                ...photo, orientation: orientation
            } : photo)
        });
    }

    function saveEditedData(data: Photo[]) {
        console.log("saving edited data")

        if (!isAuthenticated) {
            console.error("this action requires authentication");
            return;
        }

        console.log(JSON.stringify(data))

        for (let i = 0; i < data.length; i++) {
            FileUploadService.update(data[i], token)
                .then((response) => {
                    console.log("response: " + JSON.stringify(response));
                }).catch((error) => {
                    console.error("error updating photo data: " + error);
                });
        }

        setIsEditMode(false);
    }

    return (
        <div className=''>
            <Box sx={{ width: "90%", mx: "auto" }}>
                <div className="text-left pt-4 pb-4">
                    <Link to="/" className="text-blue-700 dark:text-blue-500 uppercase" relative="path"><span className='underline'>Collections</span></Link>
                    <span className="text-blue-700 dark:text-blue-500 uppercase "> &gt; <Link to={`/${params.collection}`}><span className="text-blue-700 dark:text-blue-500 underline">{params.collection}</span></Link></span>
                    <span className="text-blue-700 dark:text-blue-500 uppercase"> &gt; <span className="text-blue-700 dark:text-blue-500">{params.album}</span></span>
                    {
                        (isAuthenticated && isAdmin) && (
                            <span className='inline justify-end float-right pr-2'>
                                {
                                    isEditMode && (<button className={`mr-2 text-white bg-gray-500 hover:bg-gray-600 p-0 w-32 h-8 font-semibold text-md rounded-full active:animate-pop`} onClick={() => saveEditedData(photos)}>
                                        {
                                            "Save"
                                        }
                                    </button>)
                                }
                                <button className={`text-white bg-gray-500 w-32 p-0 font-semibold h-8 text-md rounded-full hover:bg-gray-600 active:animate-pop`} onClick={setEditMode}>
                                    {
                                        isEditMode ? "Cancel" : "Edit"
                                    }
                                </button>
                                
                            </span>
                        )
                    }
                </div>
                <RowsPhotoAlbum
                    sizes={{
                        size: "992px",
                        sizes: [
                            { viewport: "(max-width: 767px)", size: "calc(100vw - 32px)" },
                            { viewport: "(max-width: 1279px)", size: "calc(100vw - 288px)" },
                        ],
                    }}
                    photos={photos}
                    padding={0}
                    spacing={0}
                    //targetRowHeight={250}
                    onClick={({ index }) => setIndex(index)} // open in LightBox
                    render={{
                        photo: ({ onClick }, { photo }) => (
                            <div className="grid [grid-template-columns:1fr] pl-2 pr-2 pb-4 group justify-center mb-auto \">
                                <img alt={photo.description} src={photo.src} key={`img-${index}`} className={`flex justify-center [grid-column:1] [grid-row:1] rounded-sm overflow-hidden ${photo.orientation.toString().split("-")[0] === '-'} ? -rotate-${photo.orientation - 180} : rotate-${photo.orientation}`} onClick={onClick} />
                                {(isAdmin && isEditMode && isAuthenticated) && (
                                    <div id={photo.name} className={`[grid-column:1] z-0 [grid-row:1] place-self-start text-white bg-gray-500 m-1 p-1 rounded-md overflow-hidden`}>
                                        <FaArrowRotateRight id={photo.name} onClick={(e) => handleImageOrientation(e)} />
                                    </div>
                                )
                                }
                                <div className={`[grid-column:1] [grid-row:1] place-self-end block bg-gray-600 ${isAuthenticated} ? : group-hover:opacity-75 opacity-0 text-gray-300 overflow-hidden w-full`}>{photo.description}</div>
                                {
                                    (isEditMode && isAdmin && isAuthenticated) && (
                                        <div className={`rounded-b-sm flex text-white flex-col text-left pr-2 pl-2 pb-2 pt-2 bg-gray-800 border-l-2 border-r-2 border-b-2 border-b-gray-700 border-l-gray-700 border-r-gray-700`}>
                                            <label>Description</label>
                                            <input
                                                type="text"
                                                name='description'
                                                className='pl-2 rounded-sm h-8 text-gray-800'
                                                value={photo.description}
                                                id={photo.name}
                                                onChange={(event) => onChangeDescription(event)}
                                            />
                                            <TagSelectEdit
                                                id={photo.name}
                                                collection={photo.collection}
                                                album={photo.album}
                                                selectedAlbum={(event) => onChangeAlbum(event, photo.name)}
                                                selectedCollection={(event) => onChangeCollection(event, photo.name)}
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
                                            <PhotoExifData data={photo.exifData} />
                                        </div>
                                    )
                                }
                            </div>
                        ),
                    }}
                    rowConstraints={{ singleRowMaxHeight: 250 }}
                />
                <Outlet />
            </Box>
            <Lightbox
                slides={photos}
                open={index >= 0}
                index={index}
                close={() => setIndex(-1)}
                plugins={[Fullscreen, Slideshow, Thumbnails]}
                styles={{
                    container: {
                        background: "bg-gray-800",
                    },
                }}
            />
        </div>
    )
};


export default Photos;