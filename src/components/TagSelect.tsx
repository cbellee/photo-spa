/**
 * TagSelect — Legacy/alternate version of the collection + album
 * dropdown pair using react-select CreatableSelect. Integrated with
 * react-hook-form via Controller. Superseded by TagSelector which adds
 * edit-mode support and themed styling.
 *
 * @deprecated Use TagSelector instead.
 */
import React, { useState, useRef } from "react"
import CreatableSelect from "react-select/creatable";
import { useTheme } from "../context/ThemeContext";
import { useFormContext, Controller } from "react-hook-form";
import { useTags } from "../hooks/useTags";

interface TagSelectProps {
  selectedCollection: (value: string) => void;
  selectedAlbum: (value: string) => void;
  children?: React.ReactNode;
}

export default function TagSelect(props: TagSelectProps) {

  const { collectionAlbumData } = useTags();
  const [albumData, setAlbumData] = useState<string[]>([]);
  const { theme } = useTheme();
  const { control } = useFormContext();
  const albumDropDownRef = useRef<any>(null);

  const handleCollection = (event: { value: string; label: string } | null) => {
    if (!event) {
      clearSelectedAlbum();
      setAlbumData([]);
      return;
    }
    const value = event.value.toLowerCase();
    let albums = collectionAlbumData.get(event.value) ?? collectionAlbumData.get(value);

    clearSelectedAlbum();

    if (albums && albums.length > 0) {
      setAlbumData(albums);
      props.selectedCollection(value)
    } else {
      setAlbumData([]);
      props.selectedCollection(value)
    }
  }

  const handleAlbum = (event: { value: number; label: string } | null) => {
    if (event) {
      props.selectedAlbum(event.label.toLowerCase())
    }
  }

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
        </div>
      </div>
      {props.children}
    </div>
  )
}