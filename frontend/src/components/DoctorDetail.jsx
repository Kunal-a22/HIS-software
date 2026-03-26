import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Stethoscope, Phone, Mail, Award, Clock, Calendar, Edit, Loader2, AlertCircle, User } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const SPEC_COLORS = {
    'Cardiology': '#ef4444', 'Neurology': '#8b5cf6', 'Orthopedics': '#0ea5e9',
    'Pediatrics': '#f59e0b', 'Gynecology': '#ec4899', 'Dermatology': '#10b981',
    'Oncology': '#f97316', 'Psychiatry': '#6366f1', 'Radiology': '#14b8a6',
    'General Practice': '#64748b', 'Emergency Medicine': '#dc2626',
    'Anesthesiology': '#7c3aed', 'Ophthalmology': '#0284c7', 'ENT': '#059669',
    'Urology': '#d97706', 'Nephrology': '#7e22ce', 'Gastroenterology': '#b45309',
    'Endocrinology': '#0f766e', 'Other': '#475569',
};

const DoctorDetail = () => {
    const { api } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`doctors/${id}/`)
            .then(res => setDoctor(res.data))
            .catch(() => setError('Failed to load doctor information.'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="h-full flex flex-col items-center justify-center text-teal-500">
            <Loader2 className="w-14 h-14 animate-spin mb-4" />
            <p className="text-xl font-medium animate-pulse">Loading doctor profile...</p>
        </div>
    );

    if (error || !doctor) return (
        <div className="max-w-4xl mx-auto mt-10">
            <div className="p-6 rounded-2xl flex flex-col items-center text-center"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                <AlertCircle className="w-12 h-12 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Error Loading Doctor</h2>
                <p className="mb-6">{error}</p>
                <button onClick={() => navigate('/doctors')} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
                    Return to Directory
                </button>
            </div>
        </div>
    );

    const color = SPEC_COLORS[doctor.specialization] || '#475569';
    const initials = `${doctor.first_name[0]}${doctor.last_name[0]}`.toUpperCase();

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            {/* Back Nav */}
            <div className="flex items-center justify-between">
                <Link to="/doctors" className="inline-flex items-center themed-text-muted hover:text-teal-500 px-3 py-2 rounded-lg font-medium transition-all">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Directory
                </Link>
                <button className="themed-card flex items-center px-4 py-2 rounded-lg themed-text-secondary shadow-sm font-medium cursor-pointer">
                    <Edit className="w-4 h-4 mr-2" /> Edit Profile
                </button>
            </div>

            {/* Profile Banner */}
            <div className="themed-card rounded-2xl shadow-sm overflow-hidden relative">
                <div className="h-36 absolute top-0 left-0 right-0" style={{ background: `linear-gradient(135deg, ${color}cc, ${color}66)` }}></div>
                <div className="px-8 pb-8 pt-24 relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-28 h-28 rounded-full border-4 shadow-xl flex items-center justify-center text-white text-4xl font-bold shrink-0"
                        style={{ background: color, borderColor: 'var(--card-bg)' }}>
                        {initials}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-4xl font-bold themed-text-primary mb-2">
                            Dr. {doctor.first_name} {doctor.last_name}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm font-medium">
                            <span className="px-3 py-1 rounded-full text-white font-semibold" style={{ background: color }}>
                                {doctor.specialization}
                            </span>
                            <span className="themed-text-muted flex items-center gap-1.5">
                                <Award className="w-4 h-4" /> {doctor.years_of_experience} yrs experience
                            </span>
                            <span className="themed-text-muted flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" /> Joined {format(new Date(doctor.join_date), 'MMM d, yyyy')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left */}
                <div className="space-y-5">
                    {/* Contact */}
                    <div className="themed-card rounded-2xl p-6">
                        <h3 className="font-bold themed-text-primary text-lg mb-4 pb-2 themed-border border-b flex items-center gap-2">
                            <Phone className="w-5 h-5 text-teal-500" /> Contact Info
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs themed-text-muted uppercase font-bold tracking-wider mb-1">Phone</p>
                                <p className="themed-text-primary font-medium">{doctor.phone_number}</p>
                            </div>
                            <div>
                                <p className="text-xs themed-text-muted uppercase font-bold tracking-wider mb-1">Email</p>
                                <p className="themed-text-primary font-medium break-all">{doctor.email}</p>
                            </div>
                            <div>
                                <p className="text-xs themed-text-muted uppercase font-bold tracking-wider mb-1">Gender</p>
                                <p className="themed-text-primary font-medium">{doctor.gender === 'M' ? 'Male' : doctor.gender === 'F' ? 'Female' : 'Other'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Professional */}
                    <div className="themed-card rounded-2xl p-6">
                        <h3 className="font-bold themed-text-primary text-lg mb-4 pb-2 themed-border border-b flex items-center gap-2">
                            <Stethoscope className="w-5 h-5 text-teal-500" /> Professional
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs themed-text-muted uppercase font-bold tracking-wider mb-1">License No.</p>
                                <p className="themed-text-primary font-medium font-mono">{doctor.license_number}</p>
                            </div>
                            <div>
                                <p className="text-xs themed-text-muted uppercase font-bold tracking-wider mb-1">Experience</p>
                                <p className="themed-text-primary font-medium">{doctor.years_of_experience} years</p>
                            </div>
                            {doctor.availability && (
                                <div>
                                    <p className="text-xs themed-text-muted uppercase font-bold tracking-wider mb-1">Availability</p>
                                    <div className="flex items-start gap-2">
                                        <Clock className="w-4 h-4 mt-0.5 text-teal-500 shrink-0" />
                                        <p className="themed-text-primary font-medium">{doctor.availability}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right — Bio */}
                <div className="lg:col-span-2">
                    <div className="themed-card rounded-2xl p-6 h-full flex flex-col">
                        <h3 className="font-bold themed-text-primary text-lg mb-4 pb-2 themed-border border-b flex items-center gap-2">
                            <User className="w-5 h-5 text-teal-500" /> About Dr. {doctor.last_name}
                        </h3>
                        <div className="flex-1 rounded-xl p-5" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                            {doctor.bio ? (
                                <p className="themed-text-secondary leading-relaxed whitespace-pre-wrap">{doctor.bio}</p>
                            ) : (
                                <div className="flex items-center justify-center h-full themed-text-muted italic">
                                    No bio provided for this doctor.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDetail;
