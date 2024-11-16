import React, { useState, useEffect, useRef } from 'react'
import { apiConfig } from '../config/apiConfig.js'
import CreatableSelect from 'react-select/creatable';
import axios from 'axios'

export default function TagSelect(props) {

    const [options, setOptions] = useState([]);
    const [albumData, setAlbumData] = useState([]);
    const [collectionAlbumData, setCollectionAlbumData] = useState(new Map());

    const albumDropDownRef = useRef(null);

    const handleCollection = (event) => {
        let albums = collectionAlbumData.get(event.value);
       // console.log("albums: " + albums);

        clearSelectedAlbum();

        if (albums && albums.length > 0) {
            setAlbumData(albums);
            //console.log("current collection: " + event.value)
            props.selectedCollection(event.value)
        } else {
            setAlbumData([]);
            props.selectedCollection(event.value)
            //console.log("current collection: " + event.value)
        }
        props.isFormValid();
    }

    const handleAlbum = (event) => {
        if (event) {
            props.selectedAlbum(event.label)
            //console.log("current album: " + event.label)
        }
        props.isFormValid();
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
        <div className="bg-slate-800 flex rounded-md p-2 m-0">
            <div className="flex flex-row pl-4">
                <label className="text-slate-400 pt-1.5 pr-2">Collection</label>
                <CreatableSelect
                    onChange={(event, value) => handleCollection(event, value)}
                    name='collection'
                    isClearable={true}
                    className="w-48 pr-2 font-semibold text-slate-700"
                    options={
                        Array.from(collectionAlbumData.keys()).map((option, idx) => {
                            return { value: option, label: option }
                        })
                    }
                />
            </div>
            <div className="flex flex-row pl-4">
                <label className="text-slate-400 pt-1.5 pr-2">Album</label>
                <div>
                    <CreatableSelect
                        onChange={(event, value) => handleAlbum(event, value)}
                        name='album'
                        ref={albumDropDownRef}
                        className="w-48 font-semibold text-slate-700"
                        isClearable={true}
                        options={
                            albumData.map((option, idx) => {
                                return { value: idx, label: option }
                            })
                        }
                    />
                </div>
            </div>
            {props.children}
        </div>
    )
}