import { useForm, FormProvider } from 'react-hook-form';
import React, { useState } from 'react'
import TagSelect from './TagSelect.jsx';
import { apiConfig } from '../config/apiConfig.js'
import { SelectedImages } from './SelectedImages.jsx';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';

export default function UploadReactForm() {

    const [multipleImages, setMultipleImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [collection, setCollection] = useState();
    const [album, setAlbum] = useState();
    const [albumImage, setAlbumImage] = useState(null);
    const [collectionImage, setCollectionImage] = useState(null);

    const methods = useForm();

    const handleAlbumThumbnail = (imageName) => {
        setAlbumImage(imageName);
        console.log("album thumbnail: " + imageName)
    }

    const handleCollectionThumbnail = (imageName) => {
        setCollectionImage(imageName);
        console.log("collection thumbnail: " + imageName)
    }

    const onChangeCollection = (collection) => {
        console.log("collection: " + collection)
        setCollection(collection);
    }

    const onChangeAlbum = (album) => {
        console.log("album: " + album)
        setAlbum(album);
    }

    const onChangeMultipleFiles = (e) => {
        if (e.target.files) {
            const imageArray = Array.from(e.target.files).map(file => ({
                path: URL.createObjectURL(file),
                name: file.name,
                type: file.type
            }));
            console.log("images: " + JSON.stringify(imageArray));
            setMultipleImages((prevImages) => prevImages.concat(imageArray));
        } else {
            console.log("e.target.files is empty or null: " + e);
        }
    };

    const onSubmit = (data) => {
        const formData = new FormData();

        formData.append('metadata', JSON.stringify(data.metadata));
        formData.append('collection', collection);
        formData.append('album', album);
        formData.append('albumImage', albumImage)
        formData.append('collectionImage', collectionImage)

        for (const key of Object.keys(multipleImages)) {
            formData.append('photos', data.photos[key]);
            console.log("photo data: " + data.photos[key]);
        }

        console.log(JSON.stringify("form data: " + JSON.stringify(formData)));

        fetch(`${apiConfig.photoApiEndpoint}/upload`, {
            method: 'POST',
            body: formData,
        })
            .then((res) => console.log(res))
            .catch((e) => { console.log(JSON.stringify(e)) });

        setMultipleImages([]);
    };

    return (
        <>
            <AuthenticatedTemplate>
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)}>
                        <div className="flex flex-col md-auto">
                            <div className="flex flex-row p-2 justify-center">
                                <TagSelect selectedAlbum={onChangeAlbum} selectedCollection={onChangeCollection} register={methods} />
                                <div className="bg-gray-800 rounded-md m-2 p-2">
                                    <input
                                        type="file"
                                        name="photos"
                                        multiple
                                        accept="image/png, image/jpg, image/jpeg"
                                        className="text-white rounded-md"
                                        onInput={onChangeMultipleFiles}
                                        {...methods.register("photos")}
                                    />
                                    <button type="submit" className="bg-white rounded-sm w-24 h-10 m-0 p-1">Submit</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-5 md-auto pl-4 pr-4">
                                <SelectedImages images={multipleImages} albumThumbHandler={handleAlbumThumbnail} collectionThumbHandler={handleCollectionThumbnail} />
                            </div>
                        </div>
                    </form>
                </FormProvider>
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                <div className='flex h-screen'>
                    <h1 className="text-white m-auto">You must be signed in and have been previously granted access to upload photos</h1>
                </div>
            </UnauthenticatedTemplate>
        </>
    );
};