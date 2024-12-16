import React, { useState, useEffect, useRef } from 'react'
import { apiConfig } from '../config/apiConfig.ts'
import CreatableSelect from 'react-select/creatable';
import axios from 'axios'

export default function TagSelectEdit(props) {

  const [options, setOptions] = useState<{ key: string; value: string }[]>([]);
  const [albumData, setAlbumData] = useState([]);
  const [collectionAlbumData, setCollectionAlbumData] = useState(new Map());

  const albumDropDownRef = useRef<any>(null);

  const handleCollection = (event, id) => {
    let albums = collectionAlbumData.get(event.value);

    clearSelectedAlbum();

    if (albums && albums.length > 0) {
      setAlbumData(albums);
      props.selectedCollection(event.value, id)
    } else {
      setAlbumData([]);
      props.selectedCollection(event.value, id)
    }
    props.isFormValid();
  }

  const handleAlbum = (event, id) => {
    if (event) {
      props.selectedAlbum(event.label, id)
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
        ...Array.from(albumCollectionMap.entries()).map(([key, value]) => ({ key, value }))
      ])

      //console.log("albumCollectionMap: " + albumCollectionMap.entries().next().value)
    }

    getTags();
  }, []);

  const clearSelectedAlbum = () => {
    albumDropDownRef.current?.clearValue()
  }

  return (
    <div className="grid grid-cols-1">
      <div>
        <label className="pt-1.5 pr-2">Collection</label>
        <CreatableSelect
          onChange={(event) => handleCollection(event, props.id)}
          onFocus={(event) => handleCollection(event, props.id)}
          id={props.id}
          name='collection'
          isClearable={true}
          className="text-gray-800 rounded-sm"
          defaultValue={
            props.collection.length > 0 ? {
              value: props.collection, label: props.collection
            } : null
          }
          options={
            Array.from(collectionAlbumData.keys()).map((option, idx) => {
              return { value: option, label: option }
            })
          }
        />
      </div>
      <div>
        <label className="pt-1.5 pr-2 flex">Album</label>
        <CreatableSelect
          onChange={(event) => handleAlbum(event, props.id)}
          name='album'
          id={props.id}
          ref={albumDropDownRef}
          className="text-gray-800 rounded-sm"
          isClearable={true}
          defaultValue={
            props.album.length > 0 ? {
              value: props.album, label: props.album
            } : null
          }
          options={
            albumData.map((option, idx) => {
              return { value: idx, label: option }
            })
          }
        />
      </div>
      {props.children}
    </div>
  )
}