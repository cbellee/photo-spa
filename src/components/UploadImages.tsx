import React, { useState, useEffect } from "react";
import FileUploadService from "../services/FileUploadService.tsx";
import TagSelect from "./TagSelect.tsx";
import MultiRadio from "./MultiRadio.tsx";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { useIsAuthenticated } from '@azure/msal-react';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import { useMsal } from '@azure/msal-react';
import { tokenRequest } from '../config/msalConfig.ts';
import axios from 'axios';
import { apiConfig } from '../config/apiConfig.ts';
import { getAccessToken } from '../utils/utils.ts';
import { useNavigate } from "react-router-dom";
import { useTheme } from '../context/ThemeContext';

const UploadImages = () => {
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [numSelectedImages, setNumSelectedImages] = useState(0);
    const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadCompleted, setUploadCompleted] = useState(false);
    const [collection, setCollection] = useState('');
    const [album, setAlbum] = useState('');
    const [collectionImage, setCollectionImage] = useState('');
    const [collectionExists, setCollectionExists] = useState(false);
    const [albumImage, setAlbumImage] = useState('');
    const [isValid, setIsValid] = useState(false);
    const isAuthenticated = useIsAuthenticated();
    const { instance, accounts } = useMsal();
    const [token, setToken] = useState<string | null>(null);
    const [validationMessage, setValidationMessage] = useState("");
    const [progressMessage, setProgressMessage] = useState({ progess: 0, total: selectedFiles?.length });
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        getAccessToken(instance, accounts, tokenRequest, setToken);
    }, [isAuthenticated]);

    async function isFormValid() {
        //console.log("collection: " + collection + "/n collectionImage: " + collectionImage + "/n collectionExists: " + collectionExists)
        if ((collection === "" || (collectionImage === "")) && !collectionExists) {
            let msg = "Collection is not set";
            setIsValid(false);
            setValidationMessage(msg);
        } else if (album === "") {
            let msg = "Album is not set";
            setIsValid(false);
            setValidationMessage(msg);
        } else if (albumImage === "" && selectedFiles) {
            let msg = "Album image thumbnail is not set";
            setIsValid(false);
            setValidationMessage(msg);
        } else if (collectionImage === "" && !collectionExists) {
            let msg = "Collection image thumbnail is not set";
            setIsValid(false);
            setValidationMessage(msg);
        }
        else if (!selectedFiles && !uploadCompleted) {
            let msg = "No files selected";
            setIsValid(false);
            setValidationMessage(msg);
        }
        else if (uploadCompleted) {
            let msg = "Upload completed";
            setIsValid(false);
            setValidationMessage(msg);
        } else {
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

    const handleAlbumThumbnail = (imageName) => {
        setAlbumImage(imageName);
    }

    const handleCollectionThumbnail = (imageName) => {
        setCollectionImage(imageName);
    }

    const onChangeCollection = (collection) => {
        checkCollectionExists(collection);
        setCollection(collection);
    }

    const onChangeAlbum = (album) => {
        setAlbum(album);
    }

    interface ImagePreview {
        uploading: boolean;
        uploadComplete: boolean;
        uploadError?: boolean;
        src: string;
        width: number;
        height: number;
        name: string;
        type: string;
        size: number;
        collection: string;
        album: string;
        collectionImage: boolean;
        albumImage: boolean;
        description: string;
        length: number;
        uploadProgress?: number;
        orientation?: number;
        isDeleted?: boolean;
    }

    const selectFiles = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setSelectedFiles(null);
        setImagePreviews([]);

        let images: ImagePreview[] = [];

        if (!event.target.files) return;
        for (let i = 0; i < event.target.files.length; i++) {
            images.push({
                uploading: false,
                uploadComplete: false,
                uploadProgress: 0,
                src: URL.createObjectURL(event.target.files[i]),
                width: 0,
                height: 0,
                name: event.target.files[i].name,
                type: event.target.files[i].type,
                size: event.target.files[i].size,
                collection: collection,
                album: album,
                collectionImage: false,
                albumImage: false,
                description: event.target.files[i].name.split(".")[0],
                length: event.target.files.length,
            });
        }

        setSelectedFiles(event.target.files);
        setNumSelectedImages(event.target.files.length);
        setImagePreviews(images);
    };

    async function upload(idx, file) {
        await setImagePreviews((prevImages) => {
            let _images = [...prevImages];
            _images[idx].uploading = true;
            _images[idx].uploadComplete = false;
            _images[idx].collection = collection;
            _images[idx].album = album;
            _images[idx].collectionImage = collectionImage === file.name ? true : false;
            _images[idx].albumImage = albumImage === file.name ? true : false;
            _images[idx].type = file.type;
            _images[idx].description = file.name.split(".")[0];
            _images[idx].collection = collection;
            _images[idx].album = album;
            return _images;
        });

        if (!token) {
            console.error("Token is null");
            return;
        }
        return await FileUploadService.upload(file, imagePreviews[idx], token, (event) => {
            if (event.total && event.loaded) {
                let progress = Math.round((100 * event.loaded) / event.total);
                console.log(file.name + " progress: " + (100 * event.loaded) / event.total);

                setImagePreviews((prevImages) => {
                    let _images = [...prevImages];
                    _images[idx].uploadProgress = progress;
                    return _images;
                });
            }
        })
            .then(() => {
                setImagePreviews((prevImages) => {
                    let _images = [...prevImages];
                    _images[idx].uploading = false;
                    _images[idx].uploadComplete = true;
                    return _images;
                });
            })
            .catch((e) => {
                console.log("Could not upload the image: " + file.name + "with error: " + e);
                setImagePreviews((prevImages) => {
                    let _images = [...prevImages];
                    _images[idx].uploading = false;
                    _images[idx].uploadComplete = true;
                    _images[idx].uploadError = true;
                    return _images;
                });

                setUploadCompleted(true);
                setUploading(false)
            });
    };

    async function uploadImages() {
        setUploadCompleted(false);
        setUploading(true)

        if (!isValid) {
            return;
        }

        if (!selectedFiles) {
            return;
        }

        const files = Array.from(selectedFiles);
        setUploading(true);
        const uploadPromises = files.map((file, i) => upload(i, file));
        let progress = 0;

        uploadPromises.forEach((p) => {
            p.then(() => {
                progress += 1;
                //console.log("progress: " + progress);
                setProgressMessage({ progess: progress, total: selectedFiles.length });
            }).catch((e) => {

            });
        });

        Promise.all(uploadPromises)
            .then(() => FileUploadService.getFiles())
            .then((files) => {
                setUploading(false);
                setUploadCompleted(true);
                setSelectedFiles(null);
                navigate(`/${collection}`);
            })
            .catch(() => {
                setUploading(false);
                setUploadCompleted(true);
            });

        setUploading(false)
    };

    useEffect(() => {
        isFormValid();
    }, [collection, album, collectionImage, albumImage, selectedFiles]);

    return (
        <div className={`flex-cols font-thin text-white`}>
            <AuthenticatedTemplate>
                <TagSelect selectedAlbum={onChangeAlbum} selectedCollection={onChangeCollection} isFormValid={isFormValid}>
                    <label className="text-white pl-6">
                        <input
                            type="file"
                            multiple
                            disabled={uploading}
                            accept="image/jpg, image/jpeg, image/png"
                            onChange={selectFiles}
                            className="
                                block w-full
                                text-md
                                active:animate-pop
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-md file:font-semibold
                                file:bg-gray-300 file:text-gray-600
                                hover:file:bg-gray-100"
                        />
                    </label>
                    <button
                        className={`text-gray-700 block bg-gray-300 p-0 w-32 pl-2 pr-2 font-semibold text-md rounded-full hover:bg-gray-100 active:animate-pop`}
                        disabled={!isValid || uploading}
                        onClick={uploadImages}
                    >
                        Upload
                    </button>
                    <div className={`mt-2 pl-4 ${numSelectedImages > 0 ? "visible" : "hidden"} `}>
                        Uploading: {progressMessage.progess}/{numSelectedImages}
                    </div>
                    <div className={`mt-2 pl-4 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                        {validationMessage}
                    </div>
                </TagSelect>

                {imagePreviews && (
                    <div className="flex flex-col justify-items-center">
                        <div className="grid grid-cols-6">
                            {imagePreviews.map((img, i) => {
                                return (
                                    <Card className="m-1.5 p-0 text-left border-gray-800 border-2 flex min-w-44">
                                        <CardContent className="bg-gray-900 text-white">
                                            <div className="flex items-center justify-center">
                                                <CardMedia component="img" className={`aspect-square ${img.uploading ? "animate-pulse" : ""}`} image={img.src} alt={"image-" + i} key={i} />
                                                <span
                                                    className={`absolute h-10 w-10 animate-spin rounded-full ${!img.uploading ? "invisible" : ""} border-4 border-solid border-current border-r-transparent  motion-reduce:animate-[spin_1.5s_linear_infinite]`}
                                                ></span>
                                                <span className={`absolute text-sm ${!img.uploading ? "invisible" : ""}`}>
                                                    {
                                                        img.uploadProgress + "%"
                                                    }
                                                </span>
                                                <span className={`absolute text-md font-semibold ${!img.uploadComplete || !img.uploadError ? "invisible" : ""}`}>
                                                    {
                                                        img.uploadError ?
                                                            "Upload Error" :
                                                            "Upload Complete"
                                                    }
                                                </span>
                                            </div>
                                            <div className="p-0 m-0 pt-2">
                                                <label className="font-semibold">Name</label>
                                                <div className="">{imagePreviews[i].name}</div>
                                                <label className="font-semibold">Description</label>
                                                <input type="text"
                                                    value={imagePreviews[i].description}
                                                    defaultValue={imagePreviews[i].description}
                                                    className="bg-gray-700 rounded-sm pl-1 block"
                                                    onChange={(e) => { setImagePreviews((prevImages) => { let _images = [...prevImages]; _images[i].description = e.target.value; return _images; }) }}
                                                >
                                                </input>
                                                <div className="col-span-2">
                                                    {
                                                        collectionExists ?
                                                            <></>
                                                            :
                                                            <MultiRadio
                                                                groupName="Collection"
                                                                imageName={`${img.name}`}
                                                                handler={handleCollectionThumbnail}
                                                            />
                                                    }
                                                    <MultiRadio
                                                        groupName="Album"
                                                        imageName={`${img.name}`}
                                                        handler={handleAlbumThumbnail}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                <div className="justify-items-center">
                    <h2 className="text-white text-center mt-20 items-center justify-items-center visible flex transform-none relative rotate-0">
                        You must be signed in and granted access to upload photos</h2>
                </div>
            </UnauthenticatedTemplate>
        </div>
    );
};

export default UploadImages;
