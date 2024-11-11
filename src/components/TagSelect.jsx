import React, { useState, useEffect, useRef } from 'react'
import { Controller, useFormContext } from 'react-hook-form';
import { apiConfig } from '../config/apiConfig.js'
import CreatableSelect from 'react-select/creatable';
import axios from 'axios'

export default function TagSelect(props) {

    const [options, setOptions] = useState([]);
    const [albumData, setAlbumData] = useState([]);
    const [collectionAlbumData, setCollectionAlbumData] = useState(new Map());

    const albumDropDownRef = useRef(null);

    const {
        formState: { errors, isValid, isValidating, isSubmitted, validatingFields, touchedFields, isDirty },
        control,
        fieldState
    } = useFormContext();

    const handleCollection = (event) => {
        let albums = collectionAlbumData.get(event.value);
        console.log("albums: " + albums);

        clearSelectedAlbum();

        if (albums && albums.length > 0) {
            setAlbumData(albums);
            console.log("current collection: " + event.value)
            props.selectedCollection(event.value)
        } else {
            setAlbumData([]);
            props.selectedCollection(event.value)
            console.log("current collection: " + event.value)
        }
    }

    const handleAlbum = (event) => {
        if (event) {
            props.selectedAlbum(event.label)
            console.log("current album: " + event.label)
        }
    }

    useEffect(() => {
        async function getTags() {
            const data = await axios.get(`${apiConfig.photoApiEndpoint}/tags`)
            let albumCollectionMap = new Map();

            setCollectionAlbumData(albumCollectionMap)

            for (const [collection, album] of Object.entries(data.data)) {
                if (!albumCollectionMap.has(collection)) {
                    albumCollectionMap.set(collection, album);
                }
            }

            setOptions([
                { key: 'Select a collection', value: '' },
                ...albumCollectionMap
            ])
        }

        getTags();
    }, []);

    const clearSelectedAlbum = () => {
        albumDropDownRef.current?.clearValue()
    }

    return (
        <div className="bg-slate-800 flex flex-row rounded-md p-2 m-2">
            <div className="grid grid-cols-2">
                <label className="text-white pt-2">collections</label>
                <Controller
                    name='collection'
                    control={control}
                    render={({
                        field: { onChange, onBlur, value, name, ref },
                        fieldState: { invalid, isTouched, isDirty, error },
                        formState,
                    }) => (
                        <CreatableSelect
                            onBlur={onBlur}
                            onChange={(event, value) => handleCollection(event, value)}
                            name='collection'
                            isClearable={true}
                            class=""
                            options={
                                Array.from(collectionAlbumData.keys()).map((option, idx) => {
                                    return { value: option, label: option }
                                })
                            }
                        />
                    )}
                />
                {errors.collection && <span>collection is required</span>}
            </div>
            <div className="grid grid-cols-2">
                <label className="text-white pt-2" error={errors.album?.message}>albums</label>
                <div>
                    <Controller
                        name="album"
                        control={control}
                        rules={{
                            required: true
                        }}
                        render={({
                            field: { onChange, onBlur, value, name, ref },
                            fieldState: { invalid, isTouched, isDirty, error },
                            formState,
                        }) => (
                            <CreatableSelect
                                onChange={(event, value) => handleAlbum(event, value)}
                                name='album'
                                ref={albumDropDownRef}
                                onBlur={onBlur}
                                className=""
                                isClearable={true}
                                options={
                                    albumData.map((option, idx) => {
                                        return { value: idx, label: option }
                                    })
                                }
                            />
                        )}
                    />
                    {errors.album && <span>album is required</span>}
                </div>
            </div>
        </div>
    )
}