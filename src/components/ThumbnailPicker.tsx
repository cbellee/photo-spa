/**
 * ThumbnailPicker — Modal overlay that shows all photos in a collection
 * (or album) and lets the user pick one as the new thumbnail image.
 */
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import type { Photo } from '../types';
import LazyImage from './LazyImage';
import { FaXmark } from 'react-icons/fa6';

interface ThumbnailPickerProps {
    photos: Photo[];
    currentThumbnailName?: string;
    onSelect: (imageName: string) => void;
    onClose: () => void;
    title: string;
}

const ThumbnailPicker: React.FC<ThumbnailPickerProps> = ({
    photos,
    currentThumbnailName,
    onSelect,
    onClose,
    title,
}) => {
    const { theme } = useTheme();
    const dark = theme === 'dark';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
            <div
                className={`relative max-w-4xl w-[90%] max-h-[80vh] overflow-y-auto rounded-lg shadow-xl p-4 ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button onClick={onClose} className={`p-1 rounded-md ${dark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                        <FaXmark size={18} />
                    </button>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
                    {photos.map((photo) => (
                        <button
                            key={photo.name}
                            onClick={() => onSelect(photo.name)}
                            className={`relative rounded overflow-hidden border-2 transition-colors ${
                                photo.name === currentThumbnailName
                                    ? 'border-blue-500'
                                    : dark
                                    ? 'border-gray-600 hover:border-gray-400'
                                    : 'border-gray-200 hover:border-gray-400'
                            }`}
                        >
                            <LazyImage
                                src={photo.src}
                                className="w-full h-24 object-cover"
                                style={{
                                    transform: photo.orientation ? `rotate(${photo.orientation}deg)` : undefined,
                                }}
                            />
                            {photo.name === currentThumbnailName && (
                                <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                    <span className="text-xs font-bold bg-blue-500 text-white px-2 py-0.5 rounded">Current</span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ThumbnailPicker;
