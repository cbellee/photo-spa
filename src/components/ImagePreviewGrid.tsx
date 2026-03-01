import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import MultiRadio from './MultiRadio';
import { useTheme } from '../context/ThemeContext';
import type { ImagePreview } from '../types';

interface ImagePreviewGridProps {
    imagePreviews: ImagePreview[];
    collectionExists: boolean;
    albumExists: boolean;
    onDescriptionChange: (index: number, value: string) => void;
    onCollectionThumbnail: (imageName: string) => void;
    onAlbumThumbnail: (imageName: string) => void;
}

const ImagePreviewGrid: React.FC<ImagePreviewGridProps> = ({
    imagePreviews,
    collectionExists,
    albumExists,
    onDescriptionChange,
    onCollectionThumbnail,
    onAlbumThumbnail,
}) => {
    const { theme } = useTheme();

    if (!imagePreviews || imagePreviews.length === 0) return null;

    return (
        <div className="justify-items-center">
            <div className={`grid 2xl:grid-cols-7 xl:grid-cols-5 lg:grid-cols-4 sm:grid-cols-2 ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-300'}`}>
                {imagePreviews.map((img, i) => (
                    <Card key={img.name} className={`m-1.5 p-0 text-left ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} border-2`}>
                        <CardContent className={`h-full flex flex-col justify-center ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-300'}`}>
                            <div className="flex justify-items-end justify-end relative">
                                <div className="justify-end justify-items-end">
                                    <CardMedia
                                        component="img"
                                        className={`justify-items-start justify-start rounded-sm ${img.uploading ? 'animate-pulse' : ''}`}
                                        image={img.src}
                                        alt={`image-${i}`}
                                        key={i}
                                    />
                                </div>
                                <div className="absolute top-1/2 left-1/2">
                                    <span className="animate-spin rounded-full w-11 h-11 absolute border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                                    <span className="pt-3 pl-1.5 absolute text-sm">
                                        {img.uploadProgress + '%'}
                                    </span>
                                </div>
                            </div>
                            <span className={`absolute text-md font-semibold ${!img.uploadComplete || !img.uploadError ? 'invisible' : ''}`}>
                                {img.uploadError ? 'Upload Error' : 'Upload Complete'}
                            </span>
                            <div className="h-full"></div>
                            <div className="flex flex-col">
                                <div className="p-0 m-0 pt-2 justify-end flex flex-col">
                                    <label className="font-semibold">Name</label>
                                    <div>{img.name}</div>
                                    <label className="font-semibold">Description</label>
                                    <input
                                        type="text"
                                        value={img.description}
                                        defaultValue={img.description}
                                        className={`rounded-sm pl-1 block ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} w-full`}
                                        onChange={(e) => onDescriptionChange(i, e.target.value)}
                                    />
                                    <div className="col-span-2">
                                        {!collectionExists && (
                                            <MultiRadio
                                                groupName="Collection"
                                                imageName={img.name}
                                                handler={onCollectionThumbnail}
                                            />
                                        )}
                                        {!albumExists && (
                                            <MultiRadio
                                                groupName="Album"
                                                imageName={img.name}
                                                handler={onAlbumThumbnail}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ImagePreviewGrid;
