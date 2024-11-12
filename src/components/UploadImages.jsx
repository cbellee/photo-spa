import React, { useState, useEffect, useRef } from "react";
import UploadService from "../services/FileUploadService";

const UploadImages = () => {
    const [selectedFiles, setSelectedFiles] = useState(undefined);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [collection, setCollection] = useState('travel');
    const [album, setAlbum] = useState('karanjini');

    const selectFiles = (event) => {
        let images = [];

        for (let i = 0; i < event.target.files.length; i++) {
            images.push(
                {
                    uploading: false,
                    message: "",
                    src: URL.createObjectURL(event.target.files[i]),
                    width: 0,
                    height: 0,
                    name: event.target.files[i].name,
                    type: event.target.files[i].type,
                    size: event.target.files[i].size,
                    collection: '',
                    album: '',
                    collectionImage: false,
                    albumImage: false
                }
            );
        }

        setSelectedFiles(event.target.files);
        //setSelectedFiles(images);
        setImagePreviews(images);
    };

    async function upload(idx, file) {

        await setImagePreviews((prevImages) => {
            let _images = [...prevImages];
            _images[idx].uploading = true;
            _images[idx].message = 'Uploading';
            _images[idx].collection = 'travel';
            _images[idx].album = 'karinjini';
            _images[idx].collectionImage = false;
            _images[idx].albumImage = false;
            _images[idx].type = file.type;
            _images[idx].description = 'yoyoyo';
            return _images;
        });

        return await UploadService.upload(file, imagePreviews[idx], (event) => {
            //console.log(file.name + " progress: " + (100 * event.loaded) / event.total);
            
            
        })
            .then(() => {
                setImagePreviews((prevImages) => {
                    let _images = [...prevImages];
                    _images[idx].uploading = false;
                    _images[idx].message = 'Completed';
                    return _images;
                });
                //console.log("file: " + JSON.stringify(imagePreviews[idx]));
            })
            .catch(() => {
                console.log("Could not upload the image: " + file.name);
            });
    };

    const uploadImages = () => {
        setUploading(true)
        const files = Array.from(selectedFiles);
        //const files = Array.from(imagePreviews);
        const uploadPromises = files.map((file, i) => upload(i, file));

        Promise.all(uploadPromises)
            .then(() => UploadService.getFiles())
            .then((files) => {
                setUploading(false);
            });

        setUploading(false)
    };

    return (
        <div>
            <div className="row">
                <div className="col-8">
                    <label className="btn btn-default p-0">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={selectFiles}
                        />
                    </label>
                </div>

                <div className="col-4">
                    <button
                        className="text-white"
                        disabled={!selectedFiles}
                        onClick={uploadImages}
                    >
                        Upload
                    </button>
                </div>
            </div>

            {/* {progressInfos &&
                progressInfos.val.length > 0 &&
                progressInfos.val.map((progressInfo, index) => (
                    <div className="mb-0 text-orange-500" key={index}>
                        <span className="text-white">{progressInfo.fileName}</span>
                        <div className="bg-green-500">
                            <div
                                className="bg-white orange-500"
                                role="progressbar"
                                aria-valuenow={progressInfo.percentage}
                                aria-valuemin="0"
                                aria-valuemax="100"
                                style={{ width: progressInfo.percentage + "%" }}
                            >
                                {progressInfo.percentage}%
                            </div>
                        </div>
                    </div>
                ))} */}

            {imagePreviews && (
                <div className="relative grid grid-cols-6">
                    {imagePreviews.map((img, i) => {
                        return (
                            <div className="relative">
                                <img className={`w-full object-cover ${img.uploading ? "animate-pulse" : ""}`} src={img.src} alt={"image-" + i} key={i} />
                                <span className="text-white w-full absolute top-0 left-0 text-center mt-10" key={"progress-" + i}>
                                    {
                                        img.message
                                    }
                                </span>
                                <input type="hidden"
                                    value={collection}
                                    //onChange={(e) => {setImagePreviews( (prevImages) => { let _images = [...prevImages]; _images[i].collection = e.target.value; return _images; })}}
                                >
                                </input>
                                <input type="hidden"
                                    value={album}
                                    //onChange={(e) => {setImagePreviews( (prevImages) => { let _images = [...prevImages]; _images[i].collection = e.target.value; return _images; })}}
                                >
                                </input>
                                <input type="text"
                                    value={imagePreviews[i].description}
                                    onChange={(e) => {setImagePreviews( (prevImages) => { let _images = [...prevImages]; _images[i].description = e.target.value; return _images; })}}
                                >
                                </input>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* {message.length > 0 && (
                <div className="text-white" role="alert">
                    <ul>
                        {message.map((item, i) => {
                            return <li key={i}>{item}</li>;
                        })}
                    </ul>
                </div>
            )} */}

            {/* {imageInfos.length > 0 && (
        <div className="card mt-3">
          <div className="card-header">List of Images</div>
          <ul className="list-group list-group-flush">
            {imageInfos &&
              imageInfos.map((img, index) => (
                <li className="list-group-item" key={index}>
                  <p>
                    <a href={img.url}>{img.name}</a>
                  </p>
                  <img src={img.url} alt={img.name} height="80px" />
                </li>
              ))}
          </ul>
        </div>
      )} */}
        </div>
    );
};

export default UploadImages;