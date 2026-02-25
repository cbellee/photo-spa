import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Box from "@mui/material/Box";
import { RowsPhotoAlbum } from 'react-photo-album';
import { useTheme } from '../context/ThemeContext';
import { fetchAlbums } from '../services/photoService';
import type { CollectionPhoto, CollectionRouteParams } from '../types';
import LoadingSpinner from './LoadingSpinner';
import Breadcrumb from './Breadcrumb';
import LazyImage from './LazyImage';

import "react-photo-album/rows.css";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

interface AlbumsProps {
    collection: string;
    album: string;
}

const Albums: React.FC<AlbumsProps> = () => {
    const [photos, setPhotos] = useState<CollectionPhoto[]>([]);
    const { theme } = useTheme();
    const [isLoading, setisLoading] = useState(true);

    const params = useParams<CollectionRouteParams>();

    useEffect(() => {
        fetchAlbums(params.collection!)
            .then(data => {
                setPhotos(data);
                setisLoading(false);
            })
            .catch(error => {
                console.error(error);
            });
    }, [params.collection]);

    return (
        <div>
            <Box sx={{ width: "90%", mx: "auto" }} className="">
                <Breadcrumb segments={[
                    { label: 'Collections', to: '/' },
                    { label: params.collection! },
                ]} />
                <LoadingSpinner visible={isLoading} />
                <RowsPhotoAlbum
                    photos={photos}
                    padding={0}
                    spacing={0}
                    key={`album-${params.collection}`}
                    targetRowHeight={200}
                    rowConstraints={{ singleRowMaxHeight: 250 }}
                    render={{
                        photo: ({ onClick }, { photo, index }) => (
                            <div className="p-1" onClick={onClick}>
                                <Link to={photo.album}>
                                <div className=''>
                                    <LazyImage src={photo.src} key={index} placeholderWidth={photo.width} placeholderHeight={photo.height} className="rounded-md hover:opacity-85 max-h-56" />
                                </div>
                                </Link>
                                <Link to={photo.album} className={`uppercase text-sm underline ${theme === 'dark' ? 'text-blue-500' : 'text-blue-700'}`}>{photo.album}</Link>
                            </div>
                        ),
                    }}
                />
            </Box>
        </div>
    );
};

export default Albums;