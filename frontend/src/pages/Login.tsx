import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { authApi } from '../auth/api';
import { UserPlus, Box, ArrowRight } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

export const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const setUser = useStore(state => state.setUser);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegister) {
                await authApi.register({ email, password });
            }

            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            await authApi.login(formData as any);

            // Cookie is set by the backend — fetch user data
            const userRes = await authApi.getMe();
            setUser(userRes.data);

            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || err.response?.data?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse: any) => {
            setError('');
            setLoading(true);
            try {
                await authApi.googleLogin(tokenResponse.access_token);

                // Cookie is set by the backend — fetch user data
                const userRes = await authApi.getMe();
                setUser(userRes.data);

                navigate('/dashboard');
            } catch (err: any) {
                setError(err.response?.data?.detail || 'Google Authentication failed');
            } finally {
                setLoading(false);
            }
        },
        onError: () => setError('Google Authentication Failed'),
    });

    return (
        <div className="min-h-screen w-full flex bg-dark-950 relative overflow-hidden">
            {/* Background Glow Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/20 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="flex-1 flex flex-col justify-center items-center p-6 z-10 w-full relative">

                <div className="w-full max-w-md">
                    {/* Header Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/30">
                            <Box size={32} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2 text-center">
                            3D Calculator <span className="text-primary-500">Pro</span>
                        </h1>
                        <p className="text-gray-400 text-center">
                            {isRegister ? 'Join today and quote instantly.' : 'Welcome back to your workspace.'}
                        </p>
                    </div>

                    {/* Main Form Box */}
                    <div className="glass-panel p-8 rounded-2xl shadow-2xl w-full">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                                <div className="w-1 h-full bg-red-500 rounded-full"></div>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="Enter your email"
                                    className="w-full bg-dark-900/50 border border-dark-700/50 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all hover:bg-dark-900/80"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-medium text-gray-300">Password</label>
                                    {!isRegister && (
                                        <a href="#" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">Forgot password?</a>
                                    )}
                                </div>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-dark-900/50 border border-dark-700/50 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all hover:bg-dark-900/80"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2 group"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : isRegister ? (
                                    <><UserPlus size={18} /> Create Account</>
                                ) : (
                                    <>Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </button>

                            <div className="relative mt-6 mb-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-dark-800 text-gray-400 glass-panel border-none">Or continue with</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => loginWithGoogle()}
                                disabled={loading}
                                className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Google
                            </button>
                        </form>
                    </div>

                    {/* Toggle Auth Mode */}
                    <div className="mt-8 text-center text-gray-400 text-sm">
                        {isRegister ? 'Already have an account?' : "Don't have an account?"}
                        <button
                            type="button"
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setError('');
                            }}
                            className="ml-2 text-white font-semibold hover:text-primary-400 transition-colors cursor-pointer"
                        >
                            {isRegister ? 'Sign in instead' : 'Create an account'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
