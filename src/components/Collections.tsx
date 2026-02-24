import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Box from "@mui/material/Box";
import { RowsPhotoAlbum } from 'react-photo-album';
import { useTheme } from '../context/ThemeContext';
import { fetchCollections } from '../services/photoService';
import type { CollectionPhoto } from '../types';
import LoadingSpinner from './LoadingSpinner';
import Breadcrumb from './Breadcrumb';

import "react-photo-album/rows.css";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

interface CollectionsProps {
    collection: string;
    album: string;
}

const Collections: React.FC<CollectionsProps> = () => {
    const [photos, setPhotos] = useState<CollectionPhoto[]>([]);
    const [isLoading, setisLoading] = useState(true);
    const { theme } = useTheme();

    useEffect(() => {
        fetchCollections()
            .then(data => {
                setPhotos(data);
                setisLoading(false);
            })
            .catch(error => {
                console.error(error);
            });
    }, []);

    return (
        <div>
            <Box sx={{ width: "90%", mx: "auto" }}>
                <Breadcrumb segments={[{ label: 'Collections' }]} />
                <LoadingSpinner visible={isLoading} />
                <RowsPhotoAlbum
                    photos={photos}
                    padding={0}
                    spacing={0}
                    targetRowHeight={200}
                    rowConstraints={{ singleRowMaxHeight: 250 }}
                    render={{
                        photo: ({ onClick }, { photo, index }) => (
                            <div className="p-1">
                                <Link to={photo.collection}>
                                    <img src={photo.src} key={index} className="rounded-md hover:opacity-85 animate-appear max-h-56" />
                                </Link>
                                <Link to={photo.collection} className={`uppercase text-sm underline ${theme === 'dark' ? 'text-blue-500' : 'text-blue-700'}`}>{photo.collection}</Link>
                            </div>
                        ),
                    }}
                />
            </Box>
        </div>
    );
}

export default Collections;