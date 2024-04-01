import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom';
import Box from "@mui/material/Box"
import { apiConfig } from '../config/apiConfig.js'
import axios from 'axios'

import { PhotoAlbum, RenderPhoto } from 'react-photo-album';
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
        console.log(url);
        console.log(response.data);
        setPhotos(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, [props.collection, props.album]);

  const renderPhoto: RenderPhoto = ({ wrapperStyle, renderDefaultPhoto, photo, layout, layoutOptions, imageProps: { alt, style, ...restImageProps } }) => (
    <Link to={photo.album} style={wrapperStyle}>
      {renderDefaultPhoto({ wrapped: true })}
      <div className="uppercase text-white text-center">{photo.album}</div>
    </Link>
  );

  return (
    <>
      <div className="container text-left pl-16 pb-5">
        <Link to=".." className="text-white uppercase" relative="path">&lt;&lt; {params.collection}</Link>
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
          renderPhoto={renderPhoto}
        />
      </Box>
    </>
  );
}