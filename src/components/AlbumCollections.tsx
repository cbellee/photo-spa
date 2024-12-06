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

interface AlbumsProps {
    collection: string;
    album: string;
}

const Albums: React.FC<AlbumsProps> = (props) => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [index, setIndex] = useState<number>(-1);

    let params = useParams<Params>();

    useEffect(() => {
        // console.log('params.collection', params.collection);
        let url = `${apiConfig.photoApiEndpoint}/${params.collection}`;
        //console.log('url: ', url);
        axios.get(url)
            .then(response => {
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
                    <Link to="/" className="text-blue-500 uppercase" relative="path"><span className='underline'>Collections</span></Link>
                    <span className="text-blue-500 uppercase"> &gt; <span className="">{params.collection}</span></span>
                </div>
                <RowsPhotoAlbum
                    photos={photos}
                    padding={0}
                    spacing={0}
                    targetRowHeight={250}
                    render={{
                        photo: ({ onClick }, { photo, index }) => (
                            <div className="pl-3 pr-3 relative">
                                <Link to={photo.album}>
                                    <img src={photo.src} key={index} className="rounded-sm hover:opacity-85 h-48" />
                                </Link>
                                <Link to={photo.album} className="uppercase text-sm underline text-blue-400">{photo.album}</Link>
                            </div>
                        ),
                    }}
                    rowConstraints={{ singleRowMaxHeight: 250 }}
                />
            </Box>
        </div>
    );
};

export default Albums;