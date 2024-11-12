import axios from "axios";
import { apiConfig } from "../config/apiConfig.js";

let url = `${apiConfig.photoApiEndpoint}`;

async function upload(file, data, onUploadProgress) {
  let formData = new FormData();

  console.log("data" + JSON.stringify(data));
  //console.log("data" + JSON.stringify(data));

  formData.append("photos", file);
  //formData.append("collectionImage", data.collectionImage);
  //formData.append("albumImage", data.albumImage);
  //formData.append("album", data.album);
  //formData.append("collection", data.collection);
  formData.append("metadata", JSON.stringify([{
    name: data.name, 
    type: data.type, 
    description: data.description, 
    size: data.size, 
    collection: data.collection, 
    album: data.album, 
    collectionImage: data.collectionImage, 
    albumImage: data.albumImage
  }]));

  return await axios.post(`${url}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "Content-Length": data.length
    },
    onUploadProgress,
  });
};

const getFiles = () => {
  return axios.get("/datas");
};

const FileUploadService = {
  upload,
  getFiles,
};

export default FileUploadService; 