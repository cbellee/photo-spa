import React, { useState, useEffect } from 'react'
import { useParams, Link, Outlet } from 'react-router-dom';
import Box from "@mui/material/Box"
import { apiConfig } from '../config/apiConfig.js'
import axios from 'axios'

import { PhotoAlbum, RenderContainer, RenderPhoto, RenderRowContainer } from 'react-photo-album';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/plugins/thumbnails.css";

export default function Photos(props) {
  const [photos, setPhotos] = useState([]);
  const [index, setIndex] = useState(-1);

  let params = useParams();

  useEffect(() => {
    let url = `${apiConfig.photoApiEndpoint}/collections/${params.collection}/albums/${params.album}`;
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

  const renderPhoto: RenderPhoto = ({ wrapperStyle, renderDefaultPhoto, photo, layout, layoutOptions, imageProps: { alt, style, ...restImageProps } }) => (
    <Link to={"/collections/" + photo.collection + "/albums/" + photo.album} style={wrapperStyle}>
      {renderDefaultPhoto({ wrapped: true })}
    </Link>
  );

  return (
    <>
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
          renderPhoto={renderPhoto}
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