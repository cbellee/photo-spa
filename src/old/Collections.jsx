import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom';
import Box from "@mui/material/Box"
import { apiConfig } from '../config/apiConfig.js'
import axios from 'axios'
import { RowsPhotoAlbum } from 'react-photo-album';

import "react-photo-album/rows.css";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

export default function Collections(props) {
  const [photos, setPhotos] = useState([]);
  const [index, setIndex] = useState(-1);

  let params = useParams();

  useEffect(() => {
    let url = `${apiConfig.photoApiEndpoint}`;
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
          <Link to=".." className="uppercase text-blue-500 underline" relative="path">Collections</Link>
        </div>
        <RowsPhotoAlbum
          photos={photos}
          padding={0}
          spacing={0}
          key={`album-${index}`} 
          targetRowHeight={250}
          render={{
            photo: ({ onClick }, { photo }) => (
              <div className="pl-3 pr-3 relative">
                <Link to={photo.collection}>
                  <img src={photo.src} className="rounded-sm hover:opacity-85" />
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