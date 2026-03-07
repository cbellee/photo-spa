/**
 * ImagePreviewGrid — Renders a CSS grid of image preview cards used on
 * the Upload page. Each card shows the selected image with an upload
 * progress overlay, a description input, and optional collection/album
 * thumbnail radio selectors (MultiRadio). Mirrors the card design of
 * the Photos edit view for visual consistency.
 */
import React from 'react';
import MultiRadio from './MultiRadio';
import { FaArrowRotateRight } from 'react-icons/fa6';
import { useTheme } from '../context/ThemeContext';
import type { ImagePreview } from '../types';

interface ImagePreviewGridProps {
    imagePreviews: ImagePreview[];
    collectionExists: boolean;
    albumExists: boolean;
    onDescriptionChange: (index: number, value: string) => void;
    onCollectionThumbnail: (imageName: string) => void;
    onAlbumThumbnail: (imageName: string) => void;
    onOrientationChange: (imageName: string) => void;
}

const ImagePreviewGrid: React.FC<ImagePreviewGridProps> = ({
    imagePreviews,
    collectionExists,
    albumExists,
    onDescriptionChange,
    onCollectionThumbnail,
    onAlbumThumbnail,
    onOrientationChange,
}) => {
    const { theme } = useTheme();

    if (!imagePreviews || imagePreviews.length === 0) return null;

    return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 pb-8 pt-4">
            {imagePreviews.map((img, i) => (
                <div
                    key={img.name}
                    className="flex flex-col overflow-visible border-1 border-gray-600 shadow-md shadow-black/60 rounded-sm"
                >
                    {/* Image area */}
                    <div className="relative h-[200px] w-full bg-slate-800 rounded-t-md overflow-hidden">
                        <img
                            src={img.src}
                            alt={`image-${i}`}
                            className={`absolute inset-0 w-full h-full p-2 object-scale-down ${img.uploading ? 'animate-pulse opacity-60' : ''}`}
                            style={{
                                transform: img.orientation ? `rotate(${img.orientation}deg)` : undefined,
                            }}
                        />
                        {/* Rotate button */}
                        {!img.uploading && (
                            <div
                                className="absolute top-2 left-2 z-10 text-neutral-400 bg-orange-900 p-1 hover:border-[1px] rounded-xl hover:bg-orange-400 hover:text-white cursor-pointer"
                                onClick={() => onOrientationChange(img.name)}
                            >
                                <FaArrowRotateRight className="rounded-xl" />
                            </div>
                        )}
                        {/* Upload progress overlay */}
                        {img.uploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <div className="flex flex-col items-center gap-1">
                                    <span className="animate-spin rounded-full w-10 h-10 border-4 border-solid border-white border-r-transparent" />
                                    <span className="text-white text-sm font-semibold">{img.uploadProgress}%</span>
                                </div>
                            </div>
                        )}
                        {/* Upload result badge */}
                        {img.uploadComplete && (
                            <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-semibold ${img.uploadError ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                                {img.uploadError ? 'Error' : 'Done'}
                            </div>
                        )}
                    </div>

                    {/* Detail panel */}
                    <div className={`flex ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-600'} rounded-b-md flex-col gap-3 text-left p-2`}>
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wide opacity-70">Name</label>
                            <div className="text-sm truncate">{img.name}</div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wide opacity-70">Description</label>
                            <input
                                type="text"
                                value={img.description}
                                className={`w-full px-1.5 py-1.5 rounded-sm text-sm border ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-500 focus:border-blue-400' : 'bg-white text-gray-800 border-gray-300 focus:border-blue-500'} outline-none transition-colors`}
                                onChange={(e) => onDescriptionChange(i, e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col">
                            {!collectionExists && (
                                <MultiRadio
                                    groupName="Collection"
                                    imageName={img.name}
                                    checked={false}
                                    handler={onCollectionThumbnail}
                                />
                            )}
                            {!albumExists && (
                                <MultiRadio
                                    groupName="Album"
                                    imageName={img.name}
                                    checked={false}
                                    handler={onAlbumThumbnail}
                                />
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ImagePreviewGrid;
