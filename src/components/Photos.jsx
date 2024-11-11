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
import "yet-another-react-lightbox/plugins/thumbnails.css";

export default function Photos(props) {
  const [photos, setPhotos] = useState([]);
  const [index, setIndex] = useState(-1);

  let params = useParams();

  useEffect(() => {
    let url = `${apiConfig.photoApiEndpoint}/${params.collection}/${params.album}`;
    axios.get(url)
      .then(response => {
        setPhotos(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, [props.collection, props.album]);

  const renderPhoto = ({ wrapperStyle, renderDefaultPhoto, photo }) => (
    <div style={wrapperStyle}>
      {console.log(photo)}
      {renderDefaultPhoto({ wrapped: true })}
      <div className="text-white text-center">{photo.description}</div>
    </div>
  );

  return (
    <div>
      <Box sx={{ width: "90%", mx: "auto" }}>
        <div className="text-left pt-4 pb-4 ">
          <Link to="/" className="text-blue-500 uppercase" relative="path"><span className='underline'>Collections</span></Link>
          <Link to=".." className="text-blue-500 uppercase" relative="path"> &gt; <span className='underline'>{params.collection}</span> &gt; </Link>
          <span className="text-blue-500 uppercase">{params.album}</span>
        </div>
        <PhotoAlbum
          photos={photos}
          layout="rows"
          padding={1}
          spacing={20}
          renderPhoto={renderPhoto}
          targetRowHeight={250}
          onClick={({ index }) => setIndex(index)}
          componentsProps={() => ({
            imageProps: { loading: "eager", className: "border-[0em] rounded-sm hover:opacity-85" },
          })}
        />
        <Outlet />
      </Box>
      <Lightbox
        slides={photos}
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        plugins={[Fullscreen, Slideshow, Thumbnails]}
      />
    </div>
  );
}