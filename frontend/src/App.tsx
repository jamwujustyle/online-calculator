import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useStore } from './store';
import { authApi } from './auth/api';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ProjectEditor } from './pages/ProjectEditor';
import { Toaster } from 'sonner';
import { I18nProvider } from './lib/i18n';

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
        <I18nProvider>
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        style: {
                            background: 'rgba(31, 41, 55, 0.9)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff',
                        },
                    }}
                />
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
        </I18nProvider>
    );
}

export default App;
