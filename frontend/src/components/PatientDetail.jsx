import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin, AlertCircle, HeartPulse, Edit, Clock, Loader2, Calendar, Pill, ClipboardList, Plus, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const PatientDetail = () => {
    const { api } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPatientDetails = async () => {
            try {
                const response = await api.get(`patients/${id}/`);
                setPatient(response.data);
            } catch (err) {
                setError('Failed to load patient information or patient does not exist.');
            } finally {
                setLoading(false);
            }
        };
        fetchPatientDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-teal-500">
                <Loader2 className="w-14 h-14 animate-spin mb-4" />
                <p className="text-xl font-medium animate-pulse">Loading patient profile...</p>
            </div>
        );
    }

    if (error || !patient) {
        return (
            <div className="max-w-4xl mx-auto mt-10">
                <div className="p-6 rounded-2xl flex flex-col items-center text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                    <AlertCircle className="w-12 h-12 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Error Loading Patient</h2>
                    <p className="mb-6">{error}</p>
                    <button onClick={() => navigate('/patients')} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
                        Return to Directory
                    </button>
                </div>
            </div>
        );
    }

    const InfoField = ({ label, children }) => (
        <div>
            <p className="text-xs themed-text-muted font-semibold uppercase tracking-wider mb-1">{label}</p>
            <div className="themed-text-primary font-medium">{children}</div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link to="/patients" className="inline-flex items-center themed-text-muted hover:text-teal-500 transition-colors px-3 py-2 rounded-lg font-medium" style={{ transition: 'all 0.2s' }}>
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Directory
                </Link>
                <button className="themed-card flex items-center px-4 py-2 rounded-lg themed-text-secondary shadow-sm font-medium cursor-pointer">
                    <Edit className="w-4 h-4 mr-2" /> Edit Profile
                </button>
            </div>

            {/* Profile Banner Card */}
            <div className="themed-card rounded-2xl shadow-sm overflow-hidden relative">
                <div className="h-32 bg-gradient-to-r from-indigo-600 to-teal-500 absolute top-0 left-0 right-0"></div>
                <div className="px-8 pb-8 pt-20 relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="w-32 h-32 rounded-full border-4 shadow-xl flex items-center justify-center shrink-0"
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--card-bg)' }}>
                        <User className="w-16 h-16 themed-text-muted" />
                    </div>
                    <div className="flex-1 text-center md:text-left pt-2">
                        <h1 className="text-4xl font-bold themed-text-primary mb-2">
                            {patient.first_name} {patient.last_name}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium">
                            <span className="px-3 py-1 rounded-full themed-text-muted" style={{ background: 'var(--bg-tertiary)' }}>
                                ID: PT-{patient.id.toString().padStart(4, '0')}
                            </span>
                            <span className="text-teal-500">
                                {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'} &bull; {
                                    Math.floor((new Date() - new Date(patient.date_of_birth)) / 3.15576e+10)
                                } yrs old
                            </span>
                            <span className="themed-text-muted flex items-center">
                                <Clock className="w-4 h-4 mr-1.5" />
                                Registered {format(new Date(patient.registration_date), 'MMM d, yyyy')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="space-y-6 lg:col-span-1">
                    <div className="themed-card rounded-2xl shadow-sm p-6">
                        <h3 className="text-lg font-bold themed-text-primary mb-4 pb-2 themed-border border-b flex items-center">
                            <User className="w-5 h-5 mr-2 text-teal-500" /> Personal Details
                        </h3>
                        <div className="space-y-4">
                            <InfoField label="Date of Birth">
                                <span className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 themed-text-muted" />
                                    {format(new Date(patient.date_of_birth), 'MMMM d, yyyy')}
                                </span>
                            </InfoField>
                            <InfoField label="Gender">
                                {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}
                            </InfoField>
                        </div>
                    </div>

                    <div className="themed-card rounded-2xl shadow-sm p-6">
                        <h3 className="text-lg font-bold themed-text-primary mb-4 pb-2 themed-border border-b flex items-center">
                            <Phone className="w-5 h-5 mr-2 text-teal-500" /> Contact Info
                        </h3>
                        <div className="space-y-4">
                            <InfoField label="Phone">{patient.phone_number}</InfoField>
                            <InfoField label="Email">{patient.email || 'N/A'}</InfoField>
                            <InfoField label="Address">
                                <div className="flex items-start">
                                    <MapPin className="w-4 h-4 mr-2 themed-text-muted mt-0.5 shrink-0" />
                                    {patient.address || 'Not provided'}
                                </div>
                            </InfoField>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6 lg:col-span-2">
                    <div className="themed-card rounded-2xl shadow-sm p-6 flex flex-col min-h-[250px]">
                        <div className="flex items-center justify-between mb-4 pb-2 themed-border border-b">
                            <h3 className="text-lg font-bold themed-text-primary flex items-center">
                                <HeartPulse className="w-5 h-5 mr-2 text-teal-500" /> Medical History Notes
                            </h3>
                        </div>
                        <div className="flex-1 rounded-xl p-5" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                            {patient.medical_history_notes ? (
                                <p className="themed-text-secondary leading-relaxed whitespace-pre-wrap">{patient.medical_history_notes}</p>
                            ) : (
                                <div className="flex items-center justify-center h-full themed-text-muted italic">
                                    No medical history notes recorded for this patient.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl p-6" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <h3 className="text-lg font-bold text-red-500 mb-4 flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2" /> Emergency Contact
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 rounded-xl p-5"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}>
                            <div>
                                <p className="text-xs text-red-500 font-bold uppercase tracking-wider mb-1">Contact Name</p>
                                <p className="themed-text-primary font-semibold text-lg">{patient.emergency_contact_name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-red-500 font-bold uppercase tracking-wider mb-1">Contact Phone</p>
                                <p className="themed-text-primary font-bold text-lg flex items-center">
                                    <Phone className="w-4 h-4 mr-2 text-red-400" />
                                    {patient.emergency_contact_phone}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Prescriptions Section */}
                    <div className="themed-card rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4 pb-2 themed-border border-b">
                            <h3 className="text-lg font-bold themed-text-primary flex items-center">
                                <Pill className="w-5 h-5 mr-2 text-purple-500" /> Prescriptions
                            </h3>
                            <Link
                                to={`/patients/${patient.id}/prescribe`}
                                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all"
                            >
                                <Plus size={16} /> Issue New
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {patient.prescriptions && patient.prescriptions.length > 0 ? (
                                patient.prescriptions.map(presc => (
                                    <div key={presc.id} className="p-4 rounded-xl border themed-border" style={{ background: 'var(--bg-tertiary)' }}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-bold themed-text-primary">Dr. {presc.doctor_last_name}</p>
                                                <p className="text-xs themed-text-muted">{format(new Date(presc.created_at), 'MMMM d, yyyy')}</p>
                                            </div>
                                            <span className="bg-purple-500/10 text-purple-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-500/20">
                                                Active
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {presc.medications.map(med => (
                                                <div key={med.id} className="flex items-center gap-2 text-sm themed-text-secondary">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                                    <span className="font-semibold">{med.name}</span>
                                                    <span>({med.dosage})</span>
                                                    <span className="text-xs themed-text-muted">— {med.frequency}, {med.duration}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center p-8 themed-text-muted text-center italic">
                                    <ClipboardList size={40} className="mb-2 opacity-20" />
                                    <p>No prescriptions found for this patient.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Medical Reports Section */}
                    <div className="themed-card rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4 pb-2 themed-border border-b">
                            <h3 className="text-lg font-bold themed-text-primary flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-emerald-500" /> Medical Reports
                            </h3>
                            <Link
                                to={`/patients/${patient.id}/upload-report`}
                                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all"
                            >
                                <Plus size={16} /> Upload Report
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {patient.medical_reports && patient.medical_reports.length > 0 ? (
                                patient.medical_reports.map(report => (
                                    <div key={report.id} className="p-4 rounded-xl border themed-border" style={{ background: 'var(--bg-tertiary)' }}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-bold text-emerald-600 text-lg mb-1">{report.disease}</h4>
                                                <p className="font-medium themed-text-primary text-sm">
                                                    Dr. {report.doctor_name || 'Admin / Not Specified'}
                                                </p>
                                                <p className="text-xs themed-text-muted mt-0.5">
                                                    {format(new Date(report.created_at), 'MMMM d, yyyy')} &bull; Duration: {report.illness_duration}
                                                </p>
                                            </div>
                                            {report.report_file && (
                                                <a
                                                    href={report.report_file}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border border-emerald-200"
                                                >
                                                    <Download size={14} /> View File
                                                </a>
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            <p className="text-[11px] uppercase tracking-wider font-bold themed-text-muted mb-1">Symptoms</p>
                                            <p className="text-sm themed-text-secondary bg-white/50 p-2 rounded-lg border themed-border">
                                                {report.symptoms}
                                            </p>
                                        </div>

                                        {report.medicines && report.medicines.length > 0 && (
                                            <div>
                                                <p className="text-[11px] uppercase tracking-wider font-bold themed-text-muted mb-1 flex items-center gap-1">
                                                    <Pill size={12} /> Prescribed Medicines
                                                </p>
                                                <div className="space-y-2 mt-2">
                                                    {report.medicines.map(med => (
                                                        <div key={med.id} className="flex items-center gap-2 text-sm themed-text-secondary bg-white/30 p-2 rounded-lg">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                            <span className="font-semibold">{med.name}</span>
                                                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{med.timing}</span>
                                                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{med.condition}</span>
                                                            <span className="text-xs themed-text-muted ml-auto">{med.frequency}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center p-8 themed-text-muted text-center italic">
                                    <FileText size={40} className="mb-2 opacity-20" />
                                    <p>No medical reports found for this patient.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDetail;
