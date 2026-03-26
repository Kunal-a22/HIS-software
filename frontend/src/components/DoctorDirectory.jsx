import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, Loader2, Stethoscope, ChevronRight, Phone, Award, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SPECIALIZATION_COLORS = {
    'Cardiology': '#ef4444',
    'Neurology': '#8b5cf6',
    'Orthopedics': '#0ea5e9',
    'Pediatrics': '#f59e0b',
    'Gynecology': '#ec4899',
    'Dermatology': '#10b981',
    'Oncology': '#f97316',
    'Psychiatry': '#6366f1',
    'Radiology': '#14b8a6',
    'General Practice': '#64748b',
    'Emergency Medicine': '#dc2626',
    'Anesthesiology': '#7c3aed',
    'Ophthalmology': '#0284c7',
    'ENT': '#059669',
    'Urology': '#d97706',
    'Nephrology': '#7e22ce',
    'Gastroenterology': '#b45309',
    'Endocrinology': '#0f766e',
    'Other': '#475569',
};

const DoctorDirectory = () => {
    const { api } = useAuth();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSpec, setFilterSpec] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await api.get('doctors/');
            setDoctors(response.data);
        } catch (err) {
            setError('Failed to load doctor directory. Please check if the server is running.');
        } finally {
            setLoading(false);
        }
    };

    const specializations = [...new Set(doctors.map(d => d.specialization))].sort();

    const filtered = doctors.filter(doc => {
        const name = `${doc.first_name} ${doc.last_name}`.toLowerCase();
        const matchSearch = name.includes(searchQuery.toLowerCase()) ||
            doc.specialization.toLowerCase().includes(searchQuery.toLowerCase());
        const matchFilter = filterSpec === '' || doc.specialization === filterSpec;
        return matchSearch && matchFilter;
    });

    const getInitials = (first, last) => `${first[0]}${last[0]}`.toUpperCase();
    const getColor = (spec) => SPECIALIZATION_COLORS[spec] || '#475569';

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold themed-text-primary flex items-center gap-3">
                        <Stethoscope className="text-teal-500" /> Doctor Directory
                    </h1>
                    <p className="themed-text-muted mt-1">Browse and manage all registered doctors</p>
                </div>
                <Link
                    to="/doctors/register"
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all"
                >
                    + Add Doctor
                </Link>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name or specialization..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="themed-input w-full pl-10 pr-4 py-3 rounded-xl shadow-sm"
                    />
                </div>
                {specializations.length > 0 && (
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <select
                            value={filterSpec}
                            onChange={e => setFilterSpec(e.target.value)}
                            className="themed-input pl-9 pr-8 py-3 rounded-xl shadow-sm appearance-none"
                        >
                            <option value="">All Specializations</option>
                            {specializations.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Content */}
            {error ? (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                    {error}
                </div>
            ) : loading ? (
                <div className="flex flex-col items-center justify-center p-20 text-teal-500">
                    <Loader2 className="w-12 h-12 animate-spin mb-4" />
                    <p className="text-lg font-medium">Loading doctor directory...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="themed-card p-12 rounded-2xl text-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--bg-tertiary)' }}>
                        <Stethoscope className="h-8 w-8 themed-text-muted" />
                    </div>
                    <h3 className="text-xl font-semibold themed-text-secondary mb-2">No doctors found</h3>
                    <p className="themed-text-muted mb-6">
                        {searchQuery || filterSpec ? "No doctors match your search." : "Start by adding your first doctor."}
                    </p>
                    <Link to="/doctors/register" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                        Register Doctor
                    </Link>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map(doctor => {
                            const color = getColor(doctor.specialization);
                            return (
                                <div key={doctor.id} className="themed-card rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all group">
                                    {/* Card top accent bar */}
                                    <div className="h-2" style={{ background: color }}></div>

                                    <div className="p-6">
                                        {/* Avatar + Name */}
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                                                style={{ background: color }}>
                                                {getInitials(doctor.first_name, doctor.last_name)}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-lg font-bold themed-text-primary truncate">
                                                    Dr. {doctor.first_name} {doctor.last_name}
                                                </h3>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white mt-1"
                                                    style={{ background: color }}>
                                                    {doctor.specialization}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Info Row */}
                                        <div className="space-y-2 mb-5">
                                            <div className="flex items-center text-sm themed-text-secondary">
                                                <Award className="w-4 h-4 mr-2 text-teal-500 shrink-0" />
                                                {doctor.years_of_experience} yr{doctor.years_of_experience !== 1 ? 's' : ''} experience
                                            </div>
                                            <div className="flex items-center text-sm themed-text-secondary">
                                                <Phone className="w-4 h-4 mr-2 text-teal-500 shrink-0" />
                                                {doctor.phone_number}
                                            </div>
                                            {doctor.availability && (
                                                <div className="text-xs themed-text-muted italic truncate">
                                                    🕐 {doctor.availability}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action */}
                                        <Link
                                            to={`/doctors/${doctor.id}`}
                                            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold text-white transition-all"
                                            style={{ background: color }}
                                        >
                                            View Profile <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <p className="themed-text-muted text-sm text-center">
                        Showing {filtered.length} of {doctors.length} doctor{doctors.length !== 1 ? 's' : ''}
                    </p>
                </>
            )}
        </div>
    );
};

export default DoctorDirectory;
