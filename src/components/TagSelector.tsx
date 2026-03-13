/**
 * TagSelector — Dual-mode collection + album dropdown pair.
 *
 *  - "create" mode: Used on the Upload page inside a react-hook-form
 *    FormProvider. Wraps CreatableSelect in Controller fields and renders
 *    a styled toolbar bar that also hosts children (file input, upload
 *    button, validation text).
 *  - "edit" mode: Used inside each Photos edit card. Receives the current
 *    collection/album as defaultValue and notifies the parent on change.
 *
 * Complexity:
 *  - Cascading dropdowns: selecting a collection filters the album options
 *    via collectionAlbumData from the useTags hook.
 *  - CreatableSelect allows users to type new collection/album names.
 *  - Custom selectStyles provide themed dark/light styling with orange
 *    accent colours for focus, selection, and indicators.
 */
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
            backgroundColor: theme === 'dark' ? '#16151f' : '#f9fafb',
            borderColor: state.isFocused
                ? '#7c5cfc'
                : (theme === 'dark' ? '#2a293d' : '#e5e3ef'),
            borderRadius: '0.75rem',
            minHeight: '2.25rem',
            fontSize: '0.875rem',
            boxShadow: state.isFocused
                ? '0 0 0 1px #7c5cfc'
                : 'none',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            '&:hover': {
                borderColor: theme === 'dark' ? '#9b7eff' : '#7c5cfc',
            },
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
            color: theme === 'dark' ? '#6b7280' : '#9ca3af',
            fontSize: '0.875rem',
        }),
        menu: (base: any) => ({
            ...base,
            backgroundColor: theme === 'dark' ? '#1e1d2b' : '#fff',
            borderRadius: '0.75rem',
            border: `1px solid ${theme === 'dark' ? '#2a293d' : '#e5e3ef'}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            zIndex: 20,
            overflow: 'hidden',
        }),
        menuList: (base: any) => ({
            ...base,
            padding: '4px 0',
        }),
        option: (base: any, state: any) => ({
            ...base,
            backgroundColor: state.isSelected
                ? '#7c5cfc'
                : state.isFocused
                    ? (theme === 'dark' ? '#252438' : '#f0ebff')
                    : 'transparent',
            color: state.isSelected
                ? '#fff'
                : (theme === 'dark' ? '#f3f4f6' : '#1f2937'),
            fontSize: '0.875rem',
            cursor: 'pointer',
            '&:active': { backgroundColor: theme === 'dark' ? '#5a3fd4' : '#ddd6fe' },
        }),
        indicatorSeparator: (base: any) => ({
            ...base,
            backgroundColor: theme === 'dark' ? '#2a293d' : '#e5e3ef',
        }),
        dropdownIndicator: (base: any, state: any) => ({
            ...base,
            color: state.isFocused
                ? '#7c5cfc'
                : (theme === 'dark' ? '#6b7280' : '#9ca3af'),
            padding: '4px',
            transition: 'color 0.15s ease',
            '&:hover': { color: '#7c5cfc' },
        }),
        clearIndicator: (base: any) => ({
            ...base,
            color: theme === 'dark' ? '#6b7280' : '#9ca3af',
            padding: '4px',
            '&:hover': { color: theme === 'dark' ? '#f87171' : '#ef4444' },
        }),
    };

    if (props.mode === 'edit') {
        return (
            <div className="grid grid-cols-1 gap-2">
                <div>
                    <label className="text-xs font-semibold tracking-wide opacity-70 mb-0.5 block">Collection</label>
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
                    <label className="text-xs font-semibold tracking-wide opacity-70 mb-0.5 block">Album</label>
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
        <div className={`flex flex-wrap gap-x-4 gap-y-3 px-4 py-3 items-end rounded-md ${theme === 'dark' ? 'bg-surface-card text-gray-200 border border-surface-border' : 'bg-surface-light-card text-gray-600 border border-surface-light-border shadow-card-light'}`}>
            <div className="flex flex-col min-w-[180px] font-normal">
                <label className="text-xs font-semibold tracking-wide opacity-70 mb-1">Collection</label>
                <Controller
                    name="collection"
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                        <CreatableSelect
                            {...field}
                            onChange={(event) => { field.onChange(event); handleCollection(event); }}
                            isClearable={true}
                            styles={selectStyles}
                            options={collectionOptions}
                        />
                    )}
                />
            </div>
            <div className="flex flex-col min-w-[180px] font-normal">
                <label className="text-xs font-semibold tracking-wide opacity-70 mb-1">Album</label>
                <Controller
                    name="album"
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                        <CreatableSelect
                            {...field}
                            onChange={(event) => { field.onChange(event); handleAlbum(event); }}
                            ref={albumDropDownRef}
                            styles={selectStyles}
                            isClearable={true}
                            options={albumOptions}
                        />
                    )}
                />
            </div>
            {props.children}
        </div>
    );
}
