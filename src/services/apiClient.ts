import axios from 'axios';
import type { AxiosError } from 'axios';
import { apiConfig } from '../config/apiConfig';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
/** Status codes that are safe to retry (transient upstream errors) */
const RETRYABLE_CODES = new Set([502, 503, 504]);

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const apiClient = axios.create({
    baseURL: apiConfig.photoApiEndpoint,
    timeout: 10_000,
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const config = error.config as any;
        if (!config) return Promise.reject(error);

        config.__retryCount = config.__retryCount || 0;

        const status = error.response?.status ?? 0;
        if (config.__retryCount < MAX_RETRIES && RETRYABLE_CODES.has(status)) {
            config.__retryCount += 1;
            const backoff = RETRY_DELAY_MS * config.__retryCount;
            console.warn(
                `[apiClient] ${status} on ${config.url} — retry ${config.__retryCount}/${MAX_RETRIES} in ${backoff}ms`,
            );
            await delay(backoff);
            return apiClient(config);
        }

        return Promise.reject(error);
    },
);

export default apiClient;
