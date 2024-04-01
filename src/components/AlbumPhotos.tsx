import React, { useState, useEffect } from 'react'
import { useParams, Outlet, Link } from 'react-router-dom';
import Box from "@mui/material/Box"
import { apiConfig } from '../config/apiConfig.js'
import axios from 'axios'

import { PhotoAlbum } from 'react-photo-album';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/plugins/thumbnails.css";

export default function AlbumPhotos(props) {
  const [photos, setPhotos] = useState([]);
  const [index, setIndex] = useState(-1);

  let params = useParams();

  useEffect(() => {
    let url = `${apiConfig.photoApiEndpoint}/${params.collection}/${params.album}`;
    axios.get(url)
      .then(response => {
        console.log(url);
        console.log(response.data);
        setPhotos(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, [props.collection, props.album]);

  return (
    <>
    <div className="container text-left pl-16 pb-5">
    <Link to=".." className="text-white uppercase" relative="path"> &lt;&lt; {params.collection} / {params.album}</Link>
    </div>
      <Box sx={{ width: "90%", mx: "auto" }}>
        <PhotoAlbum
          photos={photos}
          layout="rows"
          padding={1}
          spacing={20}
          targetRowHeight={250}
          onClick={({ index }) => setIndex(index)}
          componentsProps={() => ({
            imageProps: { loading: "eager" },
          })}
        />
        <Outlet />
      </Box>
      <Lightbox
        slides={photos}
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
      />
    </>
  );
}