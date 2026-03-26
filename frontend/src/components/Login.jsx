import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AtSign, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(username, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-[#0f172a]">
            {/* Animated Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-teal-500/10 border border-teal-500/20 mb-6 backdrop-blur-xl">
                        <ShieldCheck size={40} className="text-teal-500" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">PulseHIS</h1>
                    <p className="text-slate-400 font-medium">Hospital Information System Access</p>
                </div>

                <div className="bg-slate-800/40 backdrop-blur-2xl border border-slate-700/50 rounded-[2rem] p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300 ml-1">Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-teal-500 text-slate-500">
                                    <AtSign size={18} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-semibold text-slate-300">Password</label>
                                <a href="#" className="text-xs text-teal-500 hover:text-teal-400 font-medium transition-colors">Forgot Password?</a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-teal-500 text-slate-500">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-lg shadow-lg shadow-teal-900/20 transition-all relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <span className={loading ? 'opacity-0' : 'opacity-100 flex items-center justify-center gap-2'}>
                                Sign In <ShieldCheck size={20} />
                            </span>
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center text-white">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                </div>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
                        <p className="text-slate-500 text-sm">
                            Need technical support? <span className="text-teal-500 cursor-pointer">Contact Admin</span>
                        </p>
                    </div>
                </div>

                <p className="text-center mt-8 text-slate-500 text-xs">
                    &copy; 2026 PulseHIS. All rights reserved. Secure Health Information Access.
                </p>
            </div>
        </div>
    );
};

export default Login;
