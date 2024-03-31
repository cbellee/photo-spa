import React, { useState, useEffect } from 'react'
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

export default function Gallery(props) {
  const [photos, setPhotos] = useState([]);
  const [index, setIndex] = useState(-1);

  useEffect(() => {
    //let url = `${apiConfig.photoApiEndpoint}/?Collection=${props.collection}&Album=${props.album}`;
    let url = `${apiConfig.photoApiEndpoint}/${props.query}`;
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

  const renderPhoto: RenderPhoto = ({ layout, layoutOptions, imageProps: { alt, style, ...restImageProps } }) => (
    <div
      style={{
        border: "0px solid #fff",
        borderRadius: "0px",
        boxSizing: "content-box",
        alignItems: "center",
        width: style?.width,
        padding: "0px",
        paddingBottom: 0,
      }}
    >
      <img alt={alt} style={{ ...style, width: "100%", padding: 0 }} {...restImageProps} />
      <div
        style={{
          paddingTop: "0px",
          paddingBottom: "0px",
          overflow: "visible",
          whiteSpace: "nowrap",
          textAlign: "center",
          color: "white"
        }}
      >
       {/*  {Math.round(layout.width) + " x " + Math.round(layout.height)} */}
      </div>
    </div>
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