import axios from 'axios';
import { apiConfig } from '../config/apiConfig';

const apiClient = axios.create({
    baseURL: apiConfig.photoApiEndpoint,
});

export default apiClient;
