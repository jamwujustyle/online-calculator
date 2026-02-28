import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useStore } from './store';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ProjectEditor } from './pages/ProjectEditor';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = useStore((state) => state.token);
    if (!token) {
        return <Navigate to="/login" />;
    }
    return <>{children}</>;
};

function App() {
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
