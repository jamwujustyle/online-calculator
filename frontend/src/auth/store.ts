export interface User {
    id: string;
    email: string;
}

export interface AuthState {
    token: string | null;
    user: User | null;
    setToken: (token: string | null) => void;
    setUser: (user: User | null) => void;
    logout: () => void;
}

export const createAuthSlice = (set: any): AuthState => ({
    token: null,
    user: null,
    setToken: (token) => set({ token }),
    setUser: (user) => set({ user }),
    logout: () => set({ token: null, user: null }),
});
