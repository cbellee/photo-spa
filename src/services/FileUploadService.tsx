import axios, { AxiosRequestConfig, AxiosResponse, AxiosProgressEvent } from "axios";
import { apiConfig } from "../config/apiConfig.ts";

let url = `${apiConfig.photoApiEndpoint}`;

interface UploadPhoto {
    name: string;
    collection: string;
    album: string;
    collectionImage: boolean;
    albumImage: boolean;
    description: string;
    orientation: string;
    isDeleted: boolean;
    size: number;
    type: string;
}

interface Photo {
    name: string;
    id: string;
    url: string;
    src: string;
    width: number;
    height: number;
    collection: string;
    albumImage: boolean;
    collectionImage: boolean;
    album: string;
    description: string;
    exifData?: Record<string, string>;
    isDeleted: boolean;
    orientation: number;
}

interface UpdatePhoto {
    name: string;
    collection: string;
    collectionImage: string;
    albumImage: string;
    album: string;
    description: string;
    orientation: string;
    isDeleted: string;
}

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
    console.log('token: ', token);

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

    /*     formData.append("metadata", JSON.stringify({
            name: data.name,
            type: file.type,
            description: data.description,
            size: file.size,
            collection: data.collection,
            album: data.album,
            collectionImage: data.collectionImage,
            albumImage: data.albumImage,
            isDeleted: false,
            orientation: 0,
        })); */

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