import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom';
import Box from "@mui/material/Box"
import { apiConfig } from '../config/apiConfig.js'
import axios from 'axios'
import { RowsPhotoAlbum } from 'react-photo-album';

import "react-photo-album/rows.css";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

export default function Albums(props) {
  const [photos, setPhotos] = useState([]);
  const [index, setIndex] = useState(-1);

  let params = useParams();

  useEffect(() => {
    let url = `${apiConfig.photoApiEndpoint}/${params.collection}`;
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
          <span className="text-blue-500 uppercase" relative="path"> &gt; <span className="">{params.collection}</span></span>
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
                <img src={photo.src} key={index} className="rounded-sm hover:opacity-85" />
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
}