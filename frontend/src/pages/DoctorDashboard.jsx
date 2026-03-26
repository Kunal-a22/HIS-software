import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Calendar, Users, Activity } from 'lucide-react';

const DoctorDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Welcome, Dr. {user?.first_name || user?.username}!</h1>
            <p className="mb-8 text-gray-600">Here is your quick overview for today.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                        <Calendar className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Today's Appointments</p>
                        <p className="text-2xl font-bold">5</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
                    <div className="bg-green-100 p-3 rounded-full mr-4">
                        <Users className="text-green-600" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Patients</p>
                        <p className="text-2xl font-bold">120</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
                    <div className="bg-purple-100 p-3 rounded-full mr-4">
                        <Activity className="text-purple-600" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Pending Reports</p>
                        <p className="text-2xl font-bold">2</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <Link to="/appointments" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">View Appointments</Link>
                <Link to="/patients" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-50">View Patient Directory</Link>
            </div>
        </div>
    );
};

export default DoctorDashboard;
