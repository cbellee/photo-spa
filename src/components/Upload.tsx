/**
 * Upload — Authenticated file upload page. Lets users select images,
 * assign them to a collection and album via TagSelector (create mode),
 * add per-image descriptions in ImagePreviewGrid, choose collection/
 * album thumbnails, and upload with progress tracking.
 *
 * Complexity:
 *  - Manages parallel uploads with per-file progress callbacks that
 *    update imagePreviews state.
 *  - Validates form completeness (collection, album, files selected)
 *    and disables the upload button until valid.
 *  - After all uploads finish, navigates to the newly created album.
 *  - Uses react-hook-form FormProvider to share form context with the
 *    TagSelector child component.
 */
import React, { useState, useEffect } from "react";
import FileUploadService from "../services/FileUploadService.tsx";
import TagSelector from "./TagSelector";
import MultiRadio from "./MultiRadio.tsx";
import ImagePreviewGrid from "./ImagePreviewGrid";
import { useNavigate } from "react-router-dom";
import { useTheme } from '../context/ThemeContext.tsx';
import { useForm, SubmitHandler, FormProvider, set } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { fetchTags } from '../services/photoService';
import type { ImagePreview, UploadPhoto } from '../types';

const MAX_CONCURRENT_UPLOADS = 20;

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
    const { isAuthenticated, token } = useAuth();
    const [validationMessage, setValidationMessage] = useState("totes");
    const [progressMessage, setProgressMessage] = useState({ progess: 0, total: selectedFiles?.length });
    const navigate = useNavigate();
    const { theme } = useTheme();

    const onSubmit = (data: Record<string, unknown>) => {
        uploadImages();
    }

    async function isFormValid() {
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
        }
    }

    async function checkCollectionExists(collection: string) {
        const data = await fetchTags()
        var collectionExists = false;

        for (const [c, a] of Object.entries(data)) {
            if (c == collection) {
                collectionExists = true;
            }
        }
        setCollectionExists(collectionExists);
    }

    async function checkAlbumExists(album: string) {
        const data = await fetchTags()
        var albumExists = false;

        Object.keys(data).map((d) => {
            let v = data[d];
            if (v.includes(album)) {
                albumExists = true;
                return;
            }
        })
        setAlbumExists(albumExists);
    }

    const setCollectionAsync = (collection: string) => {
        setTimeout(() => {
            setCollection(collection);
        }, 0);
    }

    const setAlbumAsync = (album: string) => {
        setTimeout(() => {
            setAlbum(album);
        }, 0);
    }

    const handleAlbumThumbnail = (imageName: string) => {
        setAlbumImage(imageName);
    }

    const handleCollectionThumbnail = (imageName: string) => {
        setCollectionImage(imageName);
    }

    const handleOrientationChange = (imageName: string) => {
        const rotations = [0, 90, 180, 270];
        setImagePreviews((prev) =>
            prev.map((img) => {
                if (img.name !== imageName) return img;
                const current = img.orientation ?? 0;
                const idx = rotations.indexOf(current);
                return { ...img, orientation: rotations[(idx + 1) % 4] };
            })
        );
    }

    const onChangeCollection = (collection: string) => {
        checkCollectionExists(collection);
        setCollectionAsync(collection);
    }

    const onChangeAlbum = (album: string) => {
        checkAlbumExists(album);
        setAlbumAsync(album);
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

    async function upload(idx: number, file: File) {
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
        return await FileUploadService.upload(file, {
            name: imagePreviews[idx].name,
            collection: imagePreviews[idx].collection,
            album: imagePreviews[idx].album,
            collectionImage: imagePreviews[idx].collectionImage,
            albumImage: imagePreviews[idx].albumImage,
            description: imagePreviews[idx].description,
            orientation: String(imagePreviews[idx].orientation ?? 0),
            isDeleted: imagePreviews[idx].isDeleted ?? false,
            size: imagePreviews[idx].size,
            type: imagePreviews[idx].type,
        } as UploadPhoto, token, (event) => {
            if (event.total && event.loaded) {
                let progress = Math.round((100 * event.loaded) / event.total);

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
        setUploading(true);

        if (!isValid) {
            return;
        }

        if (!selectedFiles) {
            return;
        }

        const files = Array.from(selectedFiles);
        let progress = 0;

        // Concurrency-limited upload pool. At most MAX_CONCURRENT_UPLOADS
        // files are in-flight at once to avoid overwhelming the ACA Envoy
        // proxy (which returns 503 after ~30 s on excess connections).
        try {
            const queue = files.map((file, i) => ({ i, file }));
            let cursor = 0;

            async function worker() {
                while (cursor < queue.length) {
                    const job = queue[cursor++];
                    await upload(job.i, job.file);
                    progress += 1;
                    setProgressMessage({ progess: progress, total: files.length });
                }
            }

            const workers = Array.from(
                { length: Math.min(MAX_CONCURRENT_UPLOADS, files.length) },
                () => worker()
            );
            await Promise.all(workers);

            setUploading(false);
            setUploadCompleted(true);
            setSelectedFiles(null);
            navigate(`/${collection}`);
        } catch {
            setUploading(false);
            setUploadCompleted(true);
        }
    };

    useEffect(() => {
        isFormValid();
    }, [collection, album, collectionImage, albumImage, selectedFiles]);

    return (
        <FormProvider {...formMethods}>
            <form onSubmit={formMethods.handleSubmit(onSubmit)}>
                <div className="animate-appear">
                    {isAuthenticated ? (
                        <>
                            <TagSelector mode="create" selectedAlbum={onChangeAlbum} selectedCollection={onChangeCollection}>
                                <input
                                    type="file"
                                    multiple
                                    disabled={uploading}
                                    accept="image/jpg, image/jpeg, image/png"
                                    onChange={selectFiles}
                                    className={`
                                ${theme === 'dark' ? 'text-accent-light' : 'text-accent'}   
                                active:animate-pop
                                file:font-semibold
                                file:rounded-md file:border-0
                                file:text-sm  file:h-9
                                p-0
                                m-0
                                file:bg-accent file:text-white
                                file:min-w-24
                                file:mr-4
                                w-auto
                                leading-9
                                whitespace-nowrap
                                file:hover:bg-accent-dark
                                file:transition-colors
                                file:cursor-pointer`}
                                />
                                <input type="submit" hidden={true} />
                                <button
                                    type="button"
                                    className={`h-9 font-semibold text-sm w-24 min-w-24 rounded-md bg-accent hover:bg-accent-dark text-white transition-colors ${!isValid ? 'opacity-50 cursor-not-allowed' : 'active:animate-pop cursor-pointer'}`}
                                    disabled={!isValid || uploading}
                                    onClick={uploadImages}
                                >
                                    Upload
                                </button>
                                <div className={`whitespace-nowrap leading-9 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} ${numSelectedImages > 0 ? "visible" : "hidden"}`}>
                                    Uploading: {progressMessage.progess}/{numSelectedImages}
                                </div>
                                <div className={`whitespace-nowrap leading-9 text-sm ${theme === 'dark' ? 'text-accent-light' : 'text-accent'}`}>
                                    {validationMessage}
                                </div>
                            </TagSelector>

                            <ImagePreviewGrid
                                imagePreviews={imagePreviews}
                                collectionExists={collectionExists}
                                albumExists={albumExists}
                                onDescriptionChange={(i, value) => {
                                    setImagePreviews((prevImages) => {
                                        let _images = [...prevImages];
                                        _images[i].description = value;
                                        return _images;
                                    });
                                }}
                                onCollectionThumbnail={handleCollectionThumbnail}
                                onAlbumThumbnail={handleAlbumThumbnail}
                                onOrientationChange={handleOrientationChange}
                            />
                        </>
                    ) : (
                        <div className="flex items-center justify-center py-20">
                            <div className={`text-center px-8 py-6 rounded-md ${theme === 'dark' ? 'bg-surface-card border border-surface-border text-gray-300' : 'bg-surface-light-card border border-surface-light-border text-gray-600 shadow-card-light'}`}>
                                <p className="text-lg font-medium">You must be signed in and granted access to upload photos</p>
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </FormProvider>
    );
};

export default UploadImages;
