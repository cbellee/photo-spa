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
import { useTheme } from '../context/ThemeContext.tsx';
import { useForm, SubmitHandler, FormProvider, set } from 'react-hook-form';

const UploadImages = () => {
    const formMethods = useForm({ mode: "onChange", reValidateMode: "onChange" });
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [numSelectedImages, setNumSelectedImages] = useState(0);
    const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);

    const [uploading, setUploading] = useState(false);
    const [uploadCompleted, setUploadCompleted] = useState(false);

    const [collection, setCollection] = useState("");
    const [album, setAlbum] = useState("");

    const [collectionImage, setCollectionImage] = useState("");
    const [albumImage, setAlbumImage] = useState("");

    const [collectionExists, setCollectionExists] = useState(false);
    const [albumExists, setAlbumExists] = useState(false);

    const [isValid, setIsValid] = useState(false);
    const isAuthenticated = useIsAuthenticated();
    const { instance, accounts } = useMsal();
    const [token, setToken] = useState<string | null>(null);
    const [validationMessage, setValidationMessage] = useState("totes");
    const [progressMessage, setProgressMessage] = useState({ progess: 0, total: selectedFiles?.length });
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const onSubmit = (data) => {
        console.log("onSubmit: " + data);
        uploadImages();
    }

    useEffect(() => {
        getAccessToken(instance, accounts, tokenRequest, setToken);
    }, [isAuthenticated]);

    async function isFormValid() {
        /*         console.log("collection: " + collection);
                console.log("album: " + album);
                console.log("collectionImage: " + collectionImage);
                console.log("albumImage: " + albumImage);
                console.log("selectedFiles: " + selectedFiles);
                console.log("albumExists: " + albumExists);
                console.log("collectionExists: " + collectionExists); */

        if (collection === "" && !collectionExists) {
            let msg = "Collection is not set";
            setIsValid(false);
            setValidationMessage(msg);
        } else if (album === "" && !albumExists) {
            let msg = "Album is not set";
            setIsValid(false);
            setValidationMessage(msg);
        } else if (!selectedFiles && !uploadCompleted) {
            let msg = "No files selected";
            setIsValid(false);
            setValidationMessage(msg);
        } else if (collectionImage === "" && !collectionExists) {
            let msg = "Collection image thumbnail is not set";
            setIsValid(false);
            setValidationMessage(msg);
        } else if (albumImage === "" && !albumExists) {
            let msg = "Album image thumbnail is not set";
            setIsValid(false);
            setValidationMessage(msg);
        } else if (uploadCompleted) {
            let msg = "Upload completed";
            setIsValid(false);
            setValidationMessage(msg);
        } else {
            setIsValid(true);
            setValidationMessage("");
            console.log("Form is valid");
        }
    }

    async function checkCollectionExists(collection) {
        const response = await axios.get(`${apiConfig.photoApiEndpoint}/tags`)
        var collectionExists = false;

        for (const [c, a] of Object.entries(response.data)) {
            if (c == collection) {
                collectionExists = true;
            }
        }

        console.log("collection '" + collection + "' exists: " + collectionExists);
        setCollectionExists(collectionExists);
    }

    async function checkAlbumExists(album) {
        const response = await axios.get(`${apiConfig.photoApiEndpoint}/tags`)
        var albumExists = false;

        Object.keys(response.data).map((d) => {
            let v = response.data[d];
            if (v.includes(album)) {
                albumExists = true;
                return;
            }
        })

        console.log("album '" + album + "' exists: " + albumExists);
        setAlbumExists(albumExists);
    }

    const setCollectionAsync = (collection) => {
        setTimeout(() => {
            setCollection(collection);
        }, 0);
    }

    const setAlbumAsync = (album) => {
        setTimeout(() => {
            setAlbum(album);
        }, 0);
    }

    const handleAlbumThumbnail = (imageName) => {
        setAlbumImage(imageName);
    }

    const handleCollectionThumbnail = (imageName) => {
        setCollectionImage(imageName);
    }

    const onChangeCollection = (collection) => {
        checkCollectionExists(collection);
        setCollectionAsync(collection);
    }

    const onChangeAlbum = (album) => {
        checkAlbumExists(album);
        setAlbumAsync(album);
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
            console.log("Form is not valid");
            return;
        }

        if (!selectedFiles) {
            return;
        }

        const files = Array.from(selectedFiles);
        setUploading(true);
        let progress = 0;

        const uploadPromises = files.map((file, i) => upload(i, file));
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
        <FormProvider {...formMethods}>
            <form onSubmit={formMethods.handleSubmit(onSubmit)} className="">
                <div className={`font-thin text-white  text-sm`}>
                    <AuthenticatedTemplate>
                        <TagSelect selectedAlbum={onChangeAlbum} selectedCollection={onChangeCollection}>
                                <input
                                    type="file"
                                    multiple
                                    disabled={uploading}
                                    accept="image/jpg, image/jpeg, image/png"
                                    onChange={selectFiles}
                                    className={`
                                ${theme === 'dark' ? 'text-orange-500' : 'text-orange-700'}   
                                active:animate-pop
                                lowercase
                                text-orange-500
                                file:font-semibold
                                file:rounded-md file:border-0
                                file:text-md  file:h-8
                                p-0
                                m-0
                                file:bg-gray-300 file:text-gray-600
                                file:min-w-24
                                w-48
                                hover:file:bg-gray-100`}
                                />
                            <input type="submit" hidden={true} />
                            <button
                                className={`text-white active:animate-pop h-8 font-semibold text-md w-24 min-w-24 ${theme === 'dark' ? 'hover:bg-gray-100 bg-gray-300 text-gray-600' : 'hover:bg-gray-100 bg-gray-300 text-gray-600'} ${!isValid ? 'active:animate-none' : 'active:animate-pop'} p-0 rounded-md`}
                                disabled={!isValid || uploading}
                                onClick={uploadImages}
                            >
                                Upload
                            </button>
                            <div className={` items-center w-28 ${numSelectedImages > 0 ? "visible" : "hidden"} `}>
                                Uploading: {progressMessage.progess}/{numSelectedImages}
                            </div>
                            <div className={`lowercase w-22 min-w-22 ${theme === 'dark' ? 'text-orange-500' : 'text-orange-700'}`}>
                                {validationMessage} 
                            </div>
                        </TagSelect>

                        {imagePreviews && (
                            <div className="justify-items-center">
                                <div className={`grid 2xl:grid-cols-7 xl:grid-cols-5 lg:grid-cols-4 sm:grid-cols-2 ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-300'}`}>
                                    {imagePreviews.map((img, i) => {
                                        return (
                                            <Card className={`m-1.5 p-0 text-left ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}  border-2`}>
                                                <CardContent className={`h-full flex flex-col justify-center ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-300'}`}>
                                                    <div className="flex justify-items-end justify-end relative">
                                                        <div className="justify-end justify-items-end">
                                                            <CardMedia component="img" className={`justify-items-start justify-start rounded-sm ${img.uploading ? "animate-pulse" : ""}`} image={img.src} alt={"image-" + i} key={i}
                                                            />
                                                        </div>
                                                        <div className="absolute top-1/2 left-1/2 ">
                                                        <span className={`animate-spin rounded-full w-11 h-11 absolute ${!img.uploading ? "" : ""} border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]`}>
                                                        </span>
                                                            <span className={`pt-3 pl-1.5 absolute text-sm ${!img.uploading ? "" : ""}`}>
                                                            {
                                                                img.uploadProgress + "%"
                                                            }
                                                        </span>
                                                        </div>
                                                    </div>
                                                    <span className={`absolute text-md font-semibold ${!img.uploadComplete || !img.uploadError ? "invisible" : ""}`}>
                                                        {
                                                            img.uploadError ?
                                                                "Upload Error" :
                                                                "Upload Complete"
                                                        }
                                                    </span>
                                                    <div className="h-full"></div>
                                                    <div className="flex flex-col">
                                                        <div className="p-0 m-0 pt-2 justify-end flex flex-col">
                                                            <label className="font-semibold">Name</label>
                                                            <div className="">{imagePreviews[i].name}</div>
                                                            <label className="font-semibold">Description</label>
                                                            <input type="text"
                                                                value={imagePreviews[i].description}
                                                                defaultValue={imagePreviews[i].description}
                                                                className={`rounded-sm pl-1 block ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} w-full`}
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
                                                                {
                                                                    albumExists ?
                                                                        <></>
                                                                        :
                                                                        <MultiRadio
                                                                            groupName="Album"
                                                                            imageName={`${img.name}`}
                                                                            handler={handleAlbumThumbnail}
                                                                        />
                                                                }
                                                            </div>
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
            </form>
        </FormProvider>
    );
};

export default UploadImages;
