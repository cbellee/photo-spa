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
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5 pb-8">
            {imagePreviews.map((img, i) => (
                <div
                    key={img.name}
                    className={`flex flex-col overflow-visible rounded-md transition-all duration-300 ${
                        theme === 'dark'
                            ? 'bg-surface-card border border-surface-border shadow-card hover:shadow-card-hover'
                            : 'bg-surface-light-card border border-surface-light-border shadow-card-light hover:shadow-card-light-hover'
                    }`}
                >
                    {/* Image area */}
                    <div className={`relative h-[200px] w-full rounded-t-md overflow-hidden ${theme === 'dark' ? 'bg-surface' : 'bg-gray-50'}`}>
                        <img
                            src={img.src}
                            alt={`image-${i}`}
                            className={`absolute inset-0 w-full h-full p-2 object-scale-down ${img.uploading ? 'animate-pulse opacity-60' : ''}`}
                            style={{
                                transform: img.orientation ? `rotate(${img.orientation}deg)` : undefined,
                            }}
                        />
                        {/* Upload progress overlay */}
                        {img.uploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-t-md">
                                <div className="flex flex-col items-center gap-1">
                                    <span className="animate-spin rounded-full w-10 h-10 border-4 border-accent/30 border-t-accent" />
                                    <span className="text-white text-sm font-semibold">{img.uploadProgress}%</span>
                                </div>
                            </div>
                        )}
                        {/* Upload result badge */}
                        {img.uploadComplete && (
                            <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-xs font-semibold ${img.uploadError ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                                {img.uploadError ? 'Error' : 'Done'}
                            </div>
                        )}
                    </div>

                    {/* Detail panel */}
                    <div className={`flex ${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'} rounded-b-md flex-col gap-3 text-left p-3`}>
                        <div>
                            <label className="text-xs font-semibold tracking-wide opacity-70">Name</label>
                            <div className="text-sm truncate">{img.name}</div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold tracking-wide opacity-70">Description</label>
                            <input
                                type="text"
                                value={img.description}
                                className={`w-full px-2 py-1.5 rounded-md text-sm border ${theme === 'dark' ? 'bg-surface text-white border-surface-border focus:border-accent' : 'bg-gray-50 text-gray-800 border-surface-light-border focus:border-accent'} outline-none transition-colors`}
                                onChange={(e) => onDescriptionChange(i, e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col">
                            {!collectionExists && (
                                <MultiRadio
                                    groupName="collection"
                                    imageName={img.name}
                                    checked={false}
                                    handler={onCollectionThumbnail}
                                />
                            )}
                            {!albumExists && (
                                <MultiRadio
                                    groupName="album"
                                    imageName={img.name}
                                    checked={false}
                                    handler={onAlbumThumbnail}
                                />
                            )}
                        </div>
                        {!img.uploading && (
                            <div className='flex items-center gap-2 pt-1'>
                                <button
                                    type='button'
                                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${theme === 'dark' ? 'text-gray-400 hover:text-accent-light' : 'text-gray-500 hover:text-accent'}`}
                                    onClick={() => onOrientationChange(img.name)}
                                    title='Rotate image'
                                >
                                    <FaArrowRotateRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ImagePreviewGrid;
