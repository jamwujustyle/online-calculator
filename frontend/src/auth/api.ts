import { apiClient } from '../lib/apiClient';

export const authApi = {
    login: (formData: FormData) => apiClient.post('/auth/token', formData),
    register: (data: any) => apiClient.post('/auth/register', data),
    getMe: () => apiClient.get('/auth/me'),
    googleLogin: (token: string) => apiClient.post('/auth/google', { token }),
};
