import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom';
import Box from "@mui/material/Box"
import { apiConfig } from '../config/apiConfig.js'
import axios from 'axios'
import { PhotoAlbum } from 'react-photo-album';
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

  const renderPhoto = ({ wrapperStyle, photo, renderDefaultPhoto, layout, layoutOptions, imageProps: { alt, style, ...restImageProps } }) => (
    <Link to={photo.collection} style={wrapperStyle}>
      {renderDefaultPhoto({ wrapped: true })}
      <div className="uppercase text-white text-center">{photo.collection}</div>
    </Link>
  );

  return (
    <div>
      <Box sx={{ width: "90%", mx: "auto" }}>
        <div className="text-left pt-4 pb-4">
          <Link to=".." className="uppercase text-blue-500 underline" relative="path">Collections</Link>
        </div>
        <PhotoAlbum
          photos={photos}
          layout="rows"
          padding={1}
          spacing={20}
          targetRowHeight={250}
          onClick={({ index }) => setIndex(index)}
          componentsProps={() => ({
            imageProps: { loading: "eager", className: "hover:opacity-85 rounded-md" },
          })}
          renderPhoto={renderPhoto}
          rowConstraints={{ singleRowMaxHeight: 250 }}
        />
      </Box>
    </div>
  );
}