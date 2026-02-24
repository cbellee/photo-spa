import React, { useState, useRef } from 'react';
import CreatableSelect from 'react-select/creatable';
import { useTheme } from '../context/ThemeContext';
import { useFormContext, Controller } from 'react-hook-form';
import { useTags } from '../hooks/useTags';

interface TagSelectorBaseProps {
    children?: React.ReactNode;
}

interface TagSelectorCreateProps extends TagSelectorBaseProps {
    mode: 'create';
    selectedAlbum: (album: string) => void;
    selectedCollection: (collection: string) => void;
}

interface TagSelectorEditProps extends TagSelectorBaseProps {
    mode: 'edit';
    id: string;
    collection: string;
    album: string;
    selectedAlbum: (album: string, id: string) => void;
    selectedCollection: (collection: string, id: string) => void;
    isFormValid: () => void;
}

export type TagSelectorProps = TagSelectorCreateProps | TagSelectorEditProps;

type SelectOption = { value: string; label: string } | null;

export default function TagSelector(props: TagSelectorProps) {
    const { collectionAlbumData } = useTags();
    const [albumData, setAlbumData] = useState<string[]>([]);
    const { theme } = useTheme();
    const albumDropDownRef = useRef<any>(null);

    const clearSelectedAlbum = () => {
        albumDropDownRef.current?.clearValue();
    };

    const handleCollection = (event: SelectOption) => {
        if (!event) {
            clearSelectedAlbum();
            setAlbumData([]);
            if (props.mode === 'create') {
                return;
            }
            return;
        }

        const albums = collectionAlbumData.get(event.value);
        clearSelectedAlbum();

        if (albums && albums.length > 0) {
            setAlbumData(albums);
        } else {
            setAlbumData([]);
        }

        if (props.mode === 'create') {
            props.selectedCollection(event.value);
        } else {
            props.selectedCollection(event.value, props.id);
            props.isFormValid();
        }
    };

    const handleAlbum = (event: SelectOption) => {
        if (event) {
            if (props.mode === 'create') {
                props.selectedAlbum(event.label);
            } else {
                props.selectedAlbum(event.label, props.id);
                props.isFormValid();
            }
        }
    };

    const collectionOptions = Array.from(collectionAlbumData.keys()).map((option) => ({
        value: option,
        label: option,
    }));

    const albumOptions = albumData.map((option, idx) => ({
        value: String(idx),
        label: option,
    }));

    if (props.mode === 'edit') {
        return (
            <div className="grid grid-cols-1">
                <div>
                    <label className="pt-1.5 pr-2">Collection</label>
                    <CreatableSelect
                        onChange={(event) => handleCollection(event)}
                        // @ts-expect-error KNOWN BUG: onFocus passes FocusEvent where {value, label} is expected
                        onFocus={(event) => handleCollection(event)}
                        id={props.id}
                        name="collection"
                        isClearable={true}
                        className="text-gray-800 rounded-sm"
                        defaultValue={
                            props.collection.length > 0
                                ? { value: props.collection, label: props.collection }
                                : null
                        }
                        options={collectionOptions}
                    />
                </div>
                <div>
                    <label className="pt-1.5 pr-2 flex">Album</label>
                    <CreatableSelect
                        onChange={(event) => handleAlbum(event)}
                        name="album"
                        id={props.id}
                        ref={albumDropDownRef}
                        className="text-gray-800 rounded-sm"
                        isClearable={true}
                        defaultValue={
                            props.album.length > 0
                                ? { value: props.album, label: props.album }
                                : null
                        }
                        options={albumOptions}
                    />
                </div>
                {props.children}
            </div>
        );
    }

    // mode === 'create' — uses react-hook-form Controller
    const { control } = useFormContext();

    return (
        <div className={`text-white flex gap-4 p-2 items-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-400'}`}>
            <div className="gap-4 flex items-center">
                <label>Collection:</label>
                <Controller
                    name="collection"
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                        <CreatableSelect
                            {...field}
                            onChange={(event) => handleCollection(event)}
                            isClearable={true}
                            className="text-gray-700 font-semibold lowercase min-w-36"
                            options={collectionOptions}
                        />
                    )}
                />
            </div>
            <div className="gap-4 flex items-center">
                <label>Album:</label>
                <div>
                    <Controller
                        name="album"
                        control={control}
                        rules={{ required: false }}
                        render={({ field }) => (
                            <CreatableSelect
                                {...field}
                                onChange={(event) => handleAlbum(event)}
                                ref={albumDropDownRef}
                                className="text-gray-700 font-semibold lowercase w-36"
                                isClearable={true}
                                options={albumOptions}
                            />
                        )}
                    />
                </div>
            </div>
            {props.children}
        </div>
    );
}
