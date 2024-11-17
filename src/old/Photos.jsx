import React, { useState, useEffect, Fragment } from 'react'
import { useParams, Outlet, Link } from 'react-router-dom';
import Box from "@mui/material/Box"
import { apiConfig } from '../config/apiConfig.js'
import axios from 'axios'

import { RowsPhotoAlbum } from 'react-photo-album';
import "react-photo-album/rows.css";

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

  function PhotoExifData(data) {
    if (data) {
      return (
        Object.keys(data).forEach(function (key) {
          <Fragment>
            <div>
              <div className='text-white'>{key}</div>
              <div className='text-white'>{data[key]}</div>
            </div>
          </Fragment>
        }
        )
      )
    }
  }

  return (
    <div>
      <Box sx={{ width: "90%" }} className="">
        <div className="text-left pt-4 pb-4">
          <Link to="/" className="text-blue-500 uppercase" relative="path"><span className='underline'>Collections</span></Link>
          <span className="text-blue-500 uppercase" relative="path"> &gt; <span className="">{params.collection}</span></span>
        </div>
        <RowsPhotoAlbum
          photos={photos}
          padding={0}
          spacing={0}
          targetRowHeight={250}
          onClick={({ index }) => setIndex(index)} // open in LightBox
          render={{
            photo: ({ onClick }, { photo }) => (
              console.log(photo.exifData),
              <div className="grid [grid-template-columns:1fr] p-2 group justify-center mb-auto">
                <img alt={photo.description} src={photo.src} key={`img` - index} className="flex justify-center md:block [grid-column:1] [grid-row:1] rounded-sm " onClick={onClick} />
                <div className={`bg-gray-300 [grid-column:1] [grid-row:1] place-self-end flex-grow group-hover:opacity-90 opacity-0 text-gray-400 w-full overflow-hidden`}>{photo.description}</div>
                <PhotoExifData data={photo.exifData} />
              </div>
            )
          }}
          rowConstraints={{ singleRowMaxHeight: 250 }}
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