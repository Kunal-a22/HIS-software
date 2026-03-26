import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader2, Users, ChevronRight, Phone, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PatientDirectory = () => {
    const { api } = useAuth();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [genderFilter, setGenderFilter] = useState('All');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await api.get('patients/');
            setPatients(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching patients:', err);
            setError('Failed to load patient directory. Please check if the server is running.');
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(patient => {
        const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
        const ptId = `pt-${patient.id.toString().padStart(4, '0')}`;
        const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
            patient.phone_number.includes(searchQuery.toLowerCase()) ||
            ptId.includes(searchQuery.toLowerCase());

        const matchesGender = genderFilter === 'All' || patient.gender === genderFilter;
        return matchesSearch && matchesGender;
    });

    const exportToCSV = () => {
        const headers = ['ID', 'First Name', 'Last Name', 'Phone', 'Email', 'Gender', 'DOB'];
        const rows = filteredPatients.map(p => [
            `PT-${p.id.toString().padStart(4, '0')}`,
            p.first_name,
            p.last_name,
            p.phone_number,
            p.email || '',
            p.gender,
            p.date_of_birth
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(',') + '\n'
            + rows.map(e => e.join(',')).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "patients_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold themed-text-primary flex items-center gap-3">
                        <Users className="text-teal-500" /> Patient Directory
                    </h1>
                    <p className="themed-text-muted mt-1">Manage and view all registered patients</p>
                </div>

                <div className="flex gap-3">
                    <button onClick={exportToCSV} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all h-fit self-center">
                        Export CSV
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, phone, or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="themed-input w-full pl-10 pr-4 py-3 rounded-xl shadow-sm"
                        />
                    </div>
                    <select
                        value={genderFilter}
                        onChange={(e) => setGenderFilter(e.target.value)}
                        className="themed-input w-full sm:w-40 px-4 py-3 rounded-xl shadow-sm"
                    >
                        <option value="All">All Genders</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                    </select>
                </div>
            </div>

            {error ? (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                    {error}
                </div>
            ) : loading ? (
                <div className="flex flex-col items-center justify-center p-20 text-teal-500">
                    <Loader2 className="w-12 h-12 animate-spin mb-4" />
                    <p className="text-lg font-medium">Loading patient directory...</p>
                </div>
            ) : filteredPatients.length === 0 ? (
                <div className="themed-card p-12 rounded-2xl shadow-sm text-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--bg-tertiary)' }}>
                        <Users className="h-8 w-8 themed-text-muted" />
                    </div>
                    <h3 className="text-xl font-semibold themed-text-secondary mb-2">No patients found</h3>
                    <p className="themed-text-muted">
                        {searchQuery ? "No patients match your search." : "Your patient directory is currently empty."}
                    </p>
                    {!searchQuery && (
                        <Link to="/register" className="mt-6 inline-block bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                            Register New Patient
                        </Link>
                    )}
                </div>
            ) : (
                <div className="themed-card rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="themed-table-head themed-text-muted text-sm font-semibold tracking-wider">
                                    <th className="p-5">Patient Name</th>
                                    <th className="p-5">Contact Info</th>
                                    <th className="p-5">Date of Birth</th>
                                    <th className="p-5 text-center">Gender</th>
                                    <th className="p-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPatients.map((patient) => (
                                    <tr key={patient.id} className="themed-table-row">
                                        <td className="p-5">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-teal-500"
                                                    style={{ background: 'var(--hover-bg)' }}>
                                                    {patient.first_name[0]}{patient.last_name[0]}
                                                </div>
                                                <div>
                                                    <div className="font-semibold themed-text-primary">
                                                        {patient.first_name} {patient.last_name}
                                                    </div>
                                                    <div className="text-xs themed-text-muted">ID: PT-{patient.id.toString().padStart(4, '0')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col space-y-1">
                                                <div className="flex items-center themed-text-secondary text-sm">
                                                    <Phone className="w-3 h-3 mr-2" />
                                                    {patient.phone_number}
                                                </div>
                                                {patient.email && (
                                                    <div className="text-sm themed-text-muted truncate max-w-[200px]">{patient.email}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center themed-text-secondary">
                                                <CalendarIcon className="w-4 h-4 mr-2" />
                                                {new Date(patient.date_of_birth).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold ${patient.gender === 'M' ? 'bg-blue-100 text-blue-800'
                                                : patient.gender === 'F' ? 'bg-pink-100 text-pink-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <Link
                                                to={`/patients/${patient.id}`}
                                                className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                            >
                                                View <ChevronRight className="w-4 h-4 ml-1" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="themed-table-footer px-6 py-4 text-sm themed-text-muted">
                        Showing {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientDirectory;
