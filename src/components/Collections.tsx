import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Box from "@mui/material/Box";
import { apiConfig } from '../config/apiConfig.ts';
import axios from 'axios';
import { RowsPhotoAlbum } from 'react-photo-album';

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

    let params = useParams<Params>();

    useEffect(() => {
        let url = `${apiConfig.photoApiEndpoint}`;
        axios.get(url)
            .then(response => {
                console.log(response.data);
                setPhotos(response.data);
            })
            .catch(error => {
                console.error(error);
            });
    }, [props.collection, props.album]);

    return (
        <div>
            <Box sx={{ width: "90%", mx: "auto" }}>
                <div className="text-left pt-4 pb-4">
                    <Link to=".." className="uppercase text-blue-500 underline" relative="path">Collections</Link>
                </div>
                {
                    photos.length === 0 &&
                    <div className='text-white uppercase'>No Collections found</div>
                }
                <RowsPhotoAlbum
                    photos={photos}
                    padding={0}
                    spacing={0}
                    key={`album-${index}`}
                    targetRowHeight={250}
                    render={{
                        photo: ({ onClick }, { photo, index }) => (
                            <div className="pl-3 pr-3">
                                <Link to={photo.collection}>
                                    <img src={photo.src} key={index} className="rounded-sm hover:opacity-85 h-48" />
                                </Link>
                                <Link to={photo.collection} className="uppercase text-sm underline text-blue-400">{photo.collection}</Link>
                            </div>
                        ),
                    }}
                    rowConstraints={{ singleRowMaxHeight: 250 }}
                />
            </Box>
        </div>
    );
}

export default Collections;