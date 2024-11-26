import axios, { AxiosRequestConfig, AxiosResponse, AxiosProgressEvent } from "axios";
import { apiConfig } from "../config/apiConfig.ts";

let url = `${apiConfig.photoApiEndpoint}`;

interface UploadData {
    name: string;
    type: string;
    size: number;
    collection: string;
    album: string;
    collectionImage: boolean;
    albumImage: boolean;
    description: string;
    length: number;
}

async function upload(
    file: File,
    data: UploadData,
    token: string,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<AxiosResponse> {
    let formData = new FormData();

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

    const config: AxiosRequestConfig = {
        headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
        },
        onUploadProgress,
    };

    return await axios.post(`${url}/upload`, formData, config);
}

const getFiles = (): Promise<AxiosResponse> => {
    return axios.get("/files");
};

const FileUploadService = {
    upload,
    getFiles,
  };
  
export default FileUploadService; 