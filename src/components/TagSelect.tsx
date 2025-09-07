import React, { useState, useEffect, useRef } from "react"
import { apiConfig } from "../config/apiConfig.ts"
import CreatableSelect from "react-select/creatable";
import { useTheme } from "../context/ThemeContext";
import axios from "axios"
import { useForm, useFormContext, Controller } from "react-hook-form";

export default function TagSelect(props) {

  const [options, setOptions] = useState<{ key: string; value: string }[]>([]);
  const [albumData, setAlbumData] = useState([]);
  const [collectionAlbumData, setCollectionAlbumData] = useState(new Map());
  const { theme, toggleTheme } = useTheme();
  const { register, control, formState, reset } = useFormContext();
  const albumDropDownRef = useRef<any>(null);

  const handleCollection = (event) => {
    if (!event) {
      clearSelectedAlbum();
      setAlbumData([]);
      return;
    }
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
    //props.isFormValid();
  }

  const handleAlbum = (event) => {
    if (event) {
      props.selectedAlbum(event.label)
      //console.log("current album: " + event.label)
    }
    //props.isFormValid();
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
        { key: "Select a collection", value: "" },
        ...Array.from(albumCollectionMap.entries()).map(([key, value]) => ({ key, value }))
      ])
    }

    getTags();
  }, []);

  const clearSelectedAlbum = () => {
    albumDropDownRef.current?.clearValue()
  }

  return (
    <div className={`text-white flex gap-4 p-2 items-center ${theme === "dark" ? "bg-gray-700" : "bg-gray-400"}`}>
      <div className="gap-4 flex items-center">
        <label className="">Collection:</label>
        <Controller
          name="collection"
          control={control}
          rules={{
            required: false
          }}
          render={({ field, fieldState, formState }) => (
            <CreatableSelect
              {...field}
              onChange={(event) => handleCollection(event)}
              isClearable={true}
              //id="collection"
              className=" text-gray-700 font-semibold lowercase min-w-36"
              options={
                Array.from(collectionAlbumData.keys()).map((option, idx) => {
                  return { value: option, label: option }
                })
              }
            />
          )}
        />

      </div>
      <div className="gap-4 flex items-center">
        <label className="">Album:</label>
        <div>
          <Controller
            name="album"
            control={control}
            rules={{
              required: false
            }}
            render={({ field, fieldState, formState }) => (
              <CreatableSelect
                {...field}
                onChange={(event) => handleAlbum(event)}
                ref={albumDropDownRef}
                //id="album"
                className=" text-gray-700 font-semibold lowercase w-36"
                isClearable={true}
                //error={error?.message}
                options={
                  albumData.map((option, idx) => {
                    return { value: idx, label: option }
                  })
                }
              />
            )}
          />

          {/* <CreatableSelect
            {...register("album")}
            onChange={(event) => handleAlbum(event)}
            name="album"
            ref={albumDropDownRef}
            className="min-w-40 max-w-50 font-semibold text-gray-700"
            isClearable={true}
            options={
              albumData.map((option, idx) => {
                return { value: idx, label: option }
              })
            }
          /> */}

        </div>
      </div>
      {props.children}
    </div>
  )
}