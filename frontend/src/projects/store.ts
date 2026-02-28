export interface Project {
    id: string;
    title: string;
    client_name?: string;
    contact?: string;
    notes?: string;
    created_at: string;
    file_path?: string;
    file_status: 'pending' | 'processing' | 'ready' | 'error';
    poly_count?: number;
    volume_mm3?: number;
    dim_x?: number;
    dim_y?: number;
    dim_z?: number;
    production_params?: Record<string, any>;
    calculated_results?: Record<string, any>;
    ai_description?: string;
    ai_commercial_text?: string;
}

export interface ProjectsState {
    projects: Project[];
    currentProjectId: string | null;
    setProjects: (projects: Project[]) => void;
    setCurrentProject: (id: string | null) => void;
    updateProjectInList: (project: Project) => void;
    clearProjects: () => void;
}

export const createProjectsSlice = (set: any) => ({
    projects: [],
    currentProjectId: null,
    setProjects: (projects: Project[]) => set({ projects }),
    setCurrentProject: (id: string | null) => set({ currentProjectId: id }),
    updateProjectInList: (project: Project) => set((state: any) => ({
        projects: state.projects.map((p: any) => p.id === project.id ? project : p)
    })),
    clearProjects: () => set({ projects: [], currentProjectId: null }),
});
