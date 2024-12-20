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

interface AlbumsProps {
    collection: string;
    album: string;
}

const Albums: React.FC<AlbumsProps> = (props) => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [index, setIndex] = useState<number>(-1);
    const { theme } = useTheme();

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
            <Box sx={{ width: "90%", mx: "auto" }} className="">
                <div className="text-left pt-4 pb-4 text-md">
                    <Link to="/" relative="path"><span className={`${theme === 'dark' ? 'text-blue-500' : 'text-blue-700'} uppercase underline`}>Collections</span></Link>
                    <span className={`${theme === 'dark' ? 'text-blue-500' : 'text-blue-700'} uppercase`}> &gt; <span className={`${theme === 'dark' ? 'text-blue-500' : 'text-blue-700'} uppercase`}>{params.collection}</span></span>
                </div>
                <RowsPhotoAlbum
                    photos={photos}
                    padding={0}
                    spacing={0}
                    targetRowHeight={250}
                    render={{
                        photo: ({ onClick }, { photo, index }) => (
                            <div className="pl-3 pr-3 w-full h-full" onClick={onClick}>
                                <Link to={photo.album}>
                                <div className='w-full h-full'>
                                    <img src={photo.src} key={index} className="rounded-md object-scale-down hover:opacity-85 max-h-56" />
                                </div>
                                </Link>
                                <Link to={photo.album} className={`uppercase text-sm underline ${theme === 'dark' ? 'text-blue-500' : 'text-blue-700'}`}>{photo.album}</Link>
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