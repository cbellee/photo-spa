import React, { useState, useRef, useEffect } from 'react';
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

    // Pre-populate album options from the current collection in edit mode
    useEffect(() => {
        if (props.mode === 'edit' && props.collection) {
            const albums = collectionAlbumData.get(props.collection);
            if (albums && albums.length > 0) {
                setAlbumData(albums);
            }
        }
    }, [props.mode === 'edit' ? props.collection : null, collectionAlbumData]);

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

    const selectStyles = {
        control: (base: any, state: any) => ({
            ...base,
            backgroundColor: theme === 'dark' ? '#4b5563' : '#fff',
            borderColor: state.isFocused
                ? (theme === 'dark' ? '#60a5fa' : '#3b82f6')
                : (theme === 'dark' ? '#6b7280' : '#d1d5db'),
            borderRadius: '0.1rem',
            minHeight: '2rem',
            fontSize: '0.875rem',
            boxShadow: state.isFocused ? `0 0 0 0.1px ${theme === 'dark' ? '#60a5fa' : '#3b82f6'}` : 'none',
            '&:hover': { borderColor: theme === 'dark' ? '#9ca3af' : '#9ca3af' },
        }),
        singleValue: (base: any) => ({
            ...base,
            color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
        }),
        input: (base: any) => ({
            ...base,
            color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
        }),
        placeholder: (base: any) => ({
            ...base,
            color: theme === 'dark' ? '#9ca3af' : '#9ca3af',
            fontSize: '0.875rem',
        }),
        menu: (base: any) => ({
            ...base,
            backgroundColor: theme === 'dark' ? '#374151' : '#fff',
            borderRadius: '0.375rem',
            zIndex: 20,
        }),
        option: (base: any, state: any) => ({
            ...base,
            backgroundColor: state.isFocused
                ? (theme === 'dark' ? '#4b5563' : '#eff6ff')
                : 'transparent',
            color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
            fontSize: '0.875rem',
            '&:active': { backgroundColor: theme === 'dark' ? '#6b7280' : '#dbeafe' },
        }),
        indicatorSeparator: (base: any) => ({
            ...base,
            backgroundColor: theme === 'dark' ? '#6b7280' : '#d1d5db',
        }),
        dropdownIndicator: (base: any) => ({
            ...base,
            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
            padding: '4px',
        }),
        clearIndicator: (base: any) => ({
            ...base,
            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
            padding: '4px',
        }),
    };

    if (props.mode === 'edit') {
        return (
            <div className="grid grid-cols-1 gap-2">
                <div>
                    <label className="text-xs font-semibold uppercase tracking-wide opacity-70">Collection</label>
                    <CreatableSelect
                        onChange={(event) => handleCollection(event)}
                        id={props.id}
                        name="collection"
                        isClearable={true}
                        styles={selectStyles}
                        defaultValue={
                            props.collection?.length > 0
                                ? { value: props.collection, label: props.collection }
                                : null
                        }
                        options={collectionOptions}
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold uppercase tracking-wide opacity-70">Album</label>
                    <CreatableSelect
                        onChange={(event) => handleAlbum(event)}
                        name="album"
                        id={props.id}
                        ref={albumDropDownRef}
                        styles={selectStyles}
                        isClearable={true}
                        defaultValue={
                            props.album?.length > 0
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
