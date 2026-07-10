import type { AxiosRequestConfig, AxiosResponse, AxiosProgressEvent } from "axios";
import apiClient from "./apiClient";
import type { Photo, UploadPhoto, UpdatePhoto } from '../types';

async function update(
    photoData: Photo,
    token: string
): Promise<AxiosResponse> {
    let update = {
        name: photoData.name,
        collection: photoData.collection.toLowerCase(),
        collectionImage: photoData.collectionImage.toString(),
        albumImage: photoData.albumImage.toString(),
        album: photoData.album.toLowerCase(),
        description: photoData.description,
        orientation: photoData.orientation.toString(),
        isDeleted: photoData.isDeleted.toString(),
    }

    let headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    }

    return await apiClient(
        `/update/${photoData.name}`,
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

    return await apiClient.post(`/upload`, formData, config);
}

const getFiles = (): Promise<AxiosResponse> => {
    return apiClient.get("/files");
};

const FileUploadService = {
    upload,
    getFiles,
    update,
};

export default FileUploadService; 