import axios from 'axios';
import { useStore } from '../store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useStore.getState().logout();
        }
        return Promise.reject(error);
    }
);
