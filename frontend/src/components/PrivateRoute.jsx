import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const PrivateRoute = () => {
    const { tokens, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
            </div>
        );
    }

    return tokens ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
