import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createAuthSlice, AuthState } from './auth/store';
import { createProjectsSlice, ProjectsState } from './projects/store';

type AppState = AuthState & ProjectsState;

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            ...createAuthSlice(set),
            ...createProjectsSlice(set),
            logout: () => {
                set({ user: null, projects: [], currentProjectId: null });
            },
        }),
        {
            name: '3d-calc-storage',
            partialize: (state) => ({ user: state.user }),
        }
    )
);

export type { User } from './auth/store';
export type { Project } from './projects/store';
