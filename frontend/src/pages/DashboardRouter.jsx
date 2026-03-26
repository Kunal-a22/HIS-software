import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import DoctorDashboard from './DoctorDashboard';

import AdminDashboard from './AdminDashboard';

const DashboardRouter = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (user?.role === 'Doctor') {
        return <DoctorDashboard />;
    }

    if (user?.role === 'PendingDoctor') {
        return (
            <div className="flex h-full items-center justify-center p-6">
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-md text-center">
                    <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-yellow-600 text-2xl font-bold">!</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Pending Approval</h2>
                    <p className="text-gray-600">
                        Your doctor account has been registered, but it requires administrator approval before you can access the hospital dashboard.
                        Please contact the hospital IT admin.
                    </p>
                </div>
            </div>
        );
    }

    // Default or Admin
    return <AdminDashboard />;
};

export default DashboardRouter;
