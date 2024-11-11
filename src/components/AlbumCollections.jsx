import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom';
import Box from "@mui/material/Box"
import { apiConfig } from '../config/apiConfig.js'
import axios from 'axios'

import { PhotoAlbum } from 'react-photo-album';
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

  const renderPhoto = ({ wrapperStyle, renderDefaultPhoto, photo, layout, layoutOptions, imageProps: { alt, style, ...restImageProps } }) => (
    <Link to={photo.album} style={wrapperStyle}>
      {renderDefaultPhoto({ wrapped: true })}
      <div className="uppercase text-white text-center">{photo.album}</div>
    </Link>
  );

  return (
    <div>
      <Box sx={{ width: "90%", mx: "auto" }}>
        <div className="text-left pt-4 pb-4">
        <Link to="/" className="text-blue-500 uppercase" relative="path"><span className='underline'>Collections</span></Link>
          <span className="text-blue-500 uppercase" relative="path"> &gt; <span className="">{params.collection}</span></span>
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