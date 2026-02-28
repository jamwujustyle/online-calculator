import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useStore } from './store';
import { authApi } from './auth/api';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ProjectEditor } from './pages/ProjectEditor';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const user = useStore((state) => state.user);
    if (!user) {
        return <Navigate to="/login" />;
    }
    return <>{children}</>;
};

function App() {
    const [checking, setChecking] = useState(true);
    const setUser = useStore((state) => state.setUser);

    // Validate session cookie on app mount
    useEffect(() => {
        const validateSession = async () => {
            try {
                const res = await authApi.getMe();
                setUser(res.data);
            } catch {
                setUser(null);
            } finally {
                setChecking(false);
            }
        };
        validateSession();
    }, []);

    if (checking) {
        return (
            <div className="min-h-screen bg-dark-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/project/:id" element={
                        <ProtectedRoute>
                            <ProjectEditor />
                        </ProtectedRoute>
                    } />
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
            </BrowserRouter>
        </GoogleOAuthProvider>
    );
}

export default App;
