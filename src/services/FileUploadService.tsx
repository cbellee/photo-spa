import axios, { AxiosRequestConfig, AxiosResponse, AxiosProgressEvent } from "axios";
import { apiConfig } from "../config/apiConfig";
import type { Photo, UploadPhoto, UpdatePhoto } from '../types';

let url = `${apiConfig.photoApiEndpoint}`;

async function update(
    photoData: Photo,
    token: string
): Promise<AxiosResponse> {
    let update = {
        name: photoData.name,
        collection: photoData.collection,
        collectionImage: photoData.collectionImage.toString(),
        albumImage: photoData.albumImage.toString(),
        album: photoData.album,
        description: photoData.description,
        orientation: photoData.orientation.toString(),
        isDeleted: photoData.isDeleted.toString(),
    }

    console.log("update photo data: ", JSON.stringify(update));
    let headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    }

    return await axios(
        `${url}/update/${photoData.name}`,
        {
            method: "PUT",
            headers: headers,
            data: update,
        });
}

async function upload(
    file: File,
    data: UploadPhoto,
    token: string,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<AxiosResponse> {

    let formData = new FormData();

    formData.append("photo", file);
    formData.append("metadata", JSON.stringify(data));

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
    update,
};

export default FileUploadService; 