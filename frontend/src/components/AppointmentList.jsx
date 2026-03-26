import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Loader2, Clock, User, Stethoscope, ChevronRight, Search, AlertCircle, FilePlus, ExternalLink, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const AppointmentList = () => {
    const { api } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [uploadingId, setUploadingId] = useState(null);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await api.get('appointments/');
            setAppointments(response.data);
        } catch (err) {
            setError('Failed to load appointments.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e, id) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingId(id);
        const formData = new FormData();
        formData.append('report', file);
        formData.append('report_name', file.name);

        try {
            const response = await api.patch(`appointments/${id}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setAppointments(appointments.map(a => a.id === id ? { ...a, report: response.data.report, report_name: response.data.report_name } : a));
        } catch (err) {
            alert('Failed to upload report');
        } finally {
            setUploadingId(null);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await api.patch(`appointments/${id}/`, { status: newStatus });
            setAppointments(appointments.map(a => a.id === id ? { ...a, status: newStatus } : a));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const filtered = appointments.filter(a => {
        const matchesSearch = a.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.doctor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (a.reason || '').toLowerCase().includes(searchQuery.toLowerCase());

        const appDate = new Date(a.appointment_date).getTime();
        const matchesStart = startDate ? appDate >= new Date(startDate).getTime() : true;
        const matchesEnd = endDate ? appDate <= new Date(endDate).setHours(23, 59, 59, 999) : true;

        return matchesSearch && matchesStart && matchesEnd;
    });

    const exportToCSV = () => {
        const headers = ['Date', 'Time', 'Patient', 'Doctor', 'Status', 'Reason'];
        const rows = filtered.map(a => {
            const dateObj = new Date(a.appointment_date);
            return [
                format(dateObj, 'yyyy-MM-dd'),
                format(dateObj, 'HH:mm'),
                `"${a.patient_name}"`,
                `"${a.doctor_name}"`,
                a.status,
                `"${a.reason || ''}"`
            ];
        });

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(',') + '\n'
            + rows.map(e => e.join(',')).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "appointments_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold themed-text-primary flex items-center gap-3">
                        <Calendar className="text-teal-500" /> Appointment List
                    </h1>
                    <p className="themed-text-muted mt-1">Manage hospital visits and schedules</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={exportToCSV} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all">
                        Export CSV
                    </button>
                    <Link
                        to="/appointments/book"
                        className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all"
                    >
                        + Book
                    </Link>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 w-full">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search appointments by patient, doctor or reason..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="themed-input w-full pl-10 pr-4 py-3 rounded-xl shadow-sm"
                    />
                </div>
                <div className="flex gap-2 items-center w-full lg:w-auto">
                    <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="themed-input px-4 py-3 rounded-xl shadow-sm w-full sm:w-auto text-sm"
                    />
                    <span className="themed-text-muted">to</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="themed-input px-4 py-3 rounded-xl shadow-sm w-full sm:w-auto text-sm"
                    />
                </div>
            </div>

            {error ? (
                <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                    <AlertCircle size={20} /> {error}
                </div>
            ) : loading ? (
                <div className="flex flex-col items-center justify-center p-20 text-teal-500">
                    <Loader2 className="w-12 h-12 animate-spin mb-4" />
                    <p className="text-lg font-medium">Loading appointments...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="themed-card p-12 rounded-2xl text-center">
                    <h3 className="text-xl font-semibold themed-text-secondary mb-2">No appointments found</h3>
                    <p className="themed-text-muted mb-6">Schedule your first appointment to see it here.</p>
                    <Link to="/appointments/book" className="bg-teal-600 text-white py-2 px-6 rounded-lg">Book Now</Link>
                </div>
            ) : (
                <div className="themed-card rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="themed-table-head themed-text-muted text-sm font-semibold tracking-wider">
                                    <th className="p-5">Date & Time</th>
                                    <th className="p-5">Patient</th>
                                    <th className="p-5">Doctor</th>
                                    <th className="p-5">Report</th>
                                    <th className="p-5">Status</th>
                                    <th className="p-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y themed-border">
                                {filtered.map(appt => (
                                    <tr key={appt.id} className="themed-table-row">
                                        <td className="p-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold themed-text-primary">
                                                    {format(new Date(appt.appointment_date), 'MMM d, yyyy')}
                                                </span>
                                                <span className="text-xs themed-text-muted flex items-center mt-0.5">
                                                    <Clock size={12} className="mr-1" />
                                                    {format(new Date(appt.appointment_date), 'hh:mm a')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2 themed-text-primary font-medium">
                                                <User size={16} className="text-teal-500" />
                                                {appt.patient_name}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2 themed-text-primary font-medium">
                                                <Stethoscope size={16} className="text-indigo-500" />
                                                {appt.doctor_name}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            {appt.report ? (
                                                <a
                                                    href={appt.report}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-sm text-teal-500 hover:text-teal-600 font-medium transition-colors"
                                                >
                                                    <FileText size={16} />
                                                    <span className="truncate max-w-[120px]">{appt.report_name || 'View Report'}</span>
                                                    <ExternalLink size={14} />
                                                </a>
                                            ) : (
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        id={`file-${appt.id}`}
                                                        className="hidden"
                                                        onChange={(e) => handleFileUpload(e, appt.id)}
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                    />
                                                    <label
                                                        htmlFor={`file-${appt.id}`}
                                                        className="flex items-center gap-2 text-sm themed-text-muted hover:themed-text-primary cursor-pointer transition-colors"
                                                    >
                                                        {uploadingId === appt.id ? (
                                                            <Loader2 size={16} className="animate-spin text-teal-500" />
                                                        ) : (
                                                            <FilePlus size={16} />
                                                        )}
                                                        {uploadingId === appt.id ? 'Uploading...' : 'Upload Report'}
                                                    </label>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(appt.status)}`}>
                                                {appt.status}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {appt.status === 'Scheduled' && (
                                                    <button
                                                        onClick={() => updateStatus(appt.id, 'Completed')}
                                                        className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition-colors"
                                                    >
                                                        Complete
                                                    </button>
                                                )}
                                                {appt.status === 'Scheduled' && (
                                                    <button
                                                        onClick={() => updateStatus(appt.id, 'Cancelled')}
                                                        className="text-xs themed-toggle-btn px-3 py-1.5 rounded hover:bg-red-50 hover:text-red-600 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentList;
