import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Box from "@mui/material/Box";
import { apiConfig } from '../config/apiConfig.ts';
import axios from 'axios';
import { RowsPhotoAlbum } from 'react-photo-album';
import { useTheme } from '../context/ThemeContext';

import "react-photo-album/rows.css";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

interface Photo {
    id: string;
    url: string;
    src: string;
    width: number;
    height: number;
    collection: string;
    album: string;
}

interface Params extends Record<string, string | undefined> {
    collection: string;
}

interface CollectionsProps {
    collection: string;
    album: string;
}

const Collections: React.FC<CollectionsProps> = (props) => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [index, setIndex] = useState<number>(-1);
    const [isLoading, setisLoading] = useState(true);
    const { theme } = useTheme();

    let params = useParams<Params>();

    useEffect(() => {
        let url = `${apiConfig.photoApiEndpoint}`;
        axios.get(url)
            .then(response => {
                setPhotos(response.data);
                setisLoading(false);
            })
            .catch(error => {
                console.error(error);
            });
    }, [props.collection, props.album]);

    return (
        <div>
            <Box sx={{ width: "90%", mx: "auto" }}>
                <div className="text-left pt-4 pb-4 text-md">
                    <Link to=".." className={`uppercase ${theme === 'dark' ? 'text-blue-500' : 'text-blue-700'} underline`} relative="path">Collections</Link>
                </div>
                {
                    isLoading &&
                    <div className={`flex justify-center md-auto text-white ${!isLoading ? "invisible" : ""}`}>
                        <span
                            className={`justify-center md-auto mt-[3.5em] mr-[4.4em] h-28 w-28 animate-spin rounded-full border-[9px] border-solid border-white border-current border-r-transparent `}
                        >
                        </span>
                        <span className='relative top-[100px] right-[167px] uppercase'>Loading...</span>
                    </div>
                }
                <RowsPhotoAlbum
                    photos={photos}
                    padding={0}
                    spacing={0}
                    key={`album-${index}`}
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