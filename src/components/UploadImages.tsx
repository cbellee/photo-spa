import React, { useState, useEffect } from "react";
import FileUploadService from "../services/FileUploadService.tsx";
import { AccountInfo, SilentRequest, AuthenticationResult } from '@azure/msal-browser';
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

const UploadImages = () => {
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
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

    useEffect(() => {
        getAccessToken(instance, accounts, tokenRequest, setToken);
    }, [isAuthenticated]);

    async function isFormValid() {
        if ((collection === "" || collectionImage) && !collectionExists) {
            let msg = "collection is not set";
            //console.log(msg)
            setIsValid(false);
            setValidationMessage(msg);
        } else if (album === "") {
            let msg = "album is not set";
            //console.log(msg)
            setIsValid(false);
            setValidationMessage(msg);
        } else if (albumImage === "" && selectedFiles) {
            let msg = "album image thumbnail is not set";
            //console.log(msg)
            setIsValid(false);
            setValidationMessage(msg);
        } else if (collectionImage === "" && !collectionExists) {
            let msg = "collection image thumbnail is not set";
            //console.log(msg)
            setIsValid(false);
            setValidationMessage(msg);
        }
        else if (!selectedFiles && !uploadCompleted) {
            let msg = "no files selected";
            //console.log(msg)
            setIsValid(false);
            setValidationMessage(msg);
        }
        else if (uploadCompleted) {
            let msg = "upload completed";
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
                //console.log("collection exists: " + c)
                setCollectionExists(true);
            }
        }
    }

    const handleAlbumThumbnail = (imageName) => {
        setAlbumImage(imageName);
        //console.log("album thumbnail: " + imageName)
    }

    const handleCollectionThumbnail = (imageName) => {
        setCollectionImage(imageName);
        //console.log("collection thumbnail: " + imageName)
    }

    const onChangeCollection = (collection) => {
        //console.log("collection: " + collection)
        checkCollectionExists(collection);
        setCollection(collection);
    }

    const onChangeAlbum = (album) => {
        //console.log("album: " + album)
        setAlbum(album);
    }

    const getAccessToken = (instance: any, accounts: AccountInfo[], tokenRequest: SilentRequest, setToken: (token: string) => void): void => {
        instance.setActiveAccount(accounts[0]);
        instance.acquireTokenSilent({
            ...tokenRequest
        })
            .then((response: AuthenticationResult) => {
                /* console.log("access token: " + response.accessToken);
                console.log("token token: " + response.tokenType);
                console.log("id token: " + response.idToken); */
                setToken(response.accessToken);
            })
            .catch((error: any) => {
                console.log("error while getting access token: " + error);
            });
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
        setImagePreviews(images);
    };

    async function upload(idx, file) {
        await setImagePreviews((prevImages) => {
            let _images = [...prevImages];
            _images[idx].uploading = true;
            _images[idx].uploadComplete = false;
            _images[idx].collection = 'travel';
            _images[idx].album = 'karinjini';
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
            //console.log(file.name + " progress: " + (100 * event.loaded) / event.total);
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

        if (!selectedFiles) return;
        const files = Array.from(selectedFiles);
        const uploadPromises = files.map((file, i) => upload(i, file));

        Promise.all(uploadPromises)
            .then(() => FileUploadService.getFiles())
            .then((files) => {
                setUploading(false);
                setUploadCompleted(true);
                setSelectedFiles(null);
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
        <div className="flex-cols font-thin text-white">
            <AuthenticatedTemplate>
                <TagSelect selectedAlbum={onChangeAlbum} selectedCollection={onChangeCollection} isFormValid={isFormValid}>
                    <label className="text-white pl-6">
                        <input
                            type="file"
                            multiple
                            accept="image/jpg, image/jpeg, image/png"
                            onChange={selectFiles}
                            className="block w-full text-md text-slate-400 active:animate-pop
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-md file:font-semibold
                        file:bg-slate-300 file:text-slate-900
                        hover:file:bg-slate-100 hover:shadow-xl"
                        />
                    </label>
                    <button
                        className="text-slate-900 bg-slate-300 p-0 pl-2 pr-2 font-semibold text-md rounded-full w-20 hover:bg-slate-100 active:animate-pop hover:shadow-xl"
                        disabled={!isValid}
                        onClick={uploadImages}
                    >
                        Upload
                    </button>
                    <div className="mt-2 pl-4 text-red-400">
                        {validationMessage}
                    </div>
                </TagSelect>
                {imagePreviews && (
                    <div className="flex flex-col justify-items-center">
                        <div className="grid grid-cols-5">
                            {imagePreviews.map((img, i) => {
                                return (
                                    <Card className="m-1.5 p-0 text-left border-gray-800 border-2 flex min-w-44">
                                        <CardContent className="bg-gray-900 text-white">
                                            <div className="flex items-center justify-center">
                                                <CardMedia component="img" className={`aspect-square ${img.uploading ? "animate-pulse" : ""}`} image={img.src} alt={"image-" + i} key={i} />
                                                <span
                                                    className={`absolute h-8 w-8 animate-spin rounded-full ${!img.uploading ? "invisible" : ""} border-4 border-solid border-current border-r-transparent  motion-reduce:animate-[spin_1.5s_linear_infinite]`}
                                                >
                                                </span>
                                                <span className={`absolute text-md font-semibold ${!img.uploadComplete || !img.uploadError ? "invisible" : ""}`}>
                                                    {
                                                        img.uploadError ?
                                                            "Upload Error" :
                                                            "Upload Complete"
                                                    }
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 p-0 m-0 pt-2">
                                                <label className="">name</label>
                                                <div className="pl-2">{imagePreviews[i].name}</div>
                                                <label className="">description</label>
                                                <input type="text"
                                                    value={imagePreviews[i].description}
                                                    defaultValue={imagePreviews[i].description}
                                                    className="bg-gray-600 rounded-sm pl-2"
                                                    onChange={(e) => { setImagePreviews((prevImages) => { let _images = [...prevImages]; _images[i].description = e.target.value; return _images; }) }}
                                                >
                                                </input>
                                                <div className="col-span-2">
                                                    {
                                                        collectionExists ?
                                                            <></>
                                                            :
                                                            <MultiRadio
                                                                groupName="collection"
                                                                imageName={`${img.name}`}
                                                                handler={handleCollectionThumbnail}
                                                            />
                                                    }
                                                    <MultiRadio
                                                        groupName="album"
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
