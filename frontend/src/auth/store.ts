export interface User {
    id: string;
    email: string;
}

export interface AuthState {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
}

export const createAuthSlice = (set: any): AuthState => ({
    user: null,
    setUser: (user) => set({ user }),
    logout: () => set({ user: null }),
});
