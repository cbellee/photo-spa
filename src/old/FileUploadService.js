import axios from "axios";
import { apiConfig } from "../config/apiConfig.js";

let url = `${apiConfig.photoApiEndpoint}`;
//console.log("url: " + url);

async function upload(file, data, token, onUploadProgress) {
  let formData = new FormData();

  //console.log("file: " + JSON.stringify(file));
  //console.log("data: " + JSON.stringify(data));

  formData.append("photo", file);
  formData.append("metadata", JSON.stringify({
    name: data.name,
    type: data.type,
    description: data.description,
    size: data.size,
    collection: data.collection,
    album: data.album,
    collectionImage: data.collectionImage,
    albumImage: data.albumImage
  }));

  return await axios.post(`${url}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "Content-Length": data.length,
      "Authorization": `Bearer ${token}`
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