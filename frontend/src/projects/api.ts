import { apiClient } from '../lib/apiClient';

export const projectsApi = {
    getProjects: () => apiClient.get('/projects'),
    getProject: (id: string) => apiClient.get(`/projects/${id}`),
    createProject: (data: any) => apiClient.post('/projects', data),
    updateProject: (id: string, data: any) => apiClient.put(`/projects/${id}`, data),
    deleteProject: (id: string) => apiClient.delete(`/projects/${id}`),
    updateProjectParams: (id: string, params: any) => apiClient.put(`/projects/${id}/params`, params),
    uploadFile: (id: string, formData: FormData) => apiClient.post(`/projects/${id}/upload`, formData),
    generateAi: (id: string) => apiClient.post(`/projects/${id}/generate-ai`),
};
