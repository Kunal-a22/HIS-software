import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, UserPlus, Clock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BookAppointment = () => {
    const { api } = useAuth();
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        patient: '',
        doctor: '',
        appointment_date: '',
        reason: '',
        status: 'Scheduled'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [patientsRes, doctorsRes] = await Promise.all([
                    api.get('patients/'),
                    api.get('doctors/')
                ]);
                setPatients(patientsRes.data);
                setDoctors(doctorsRes.data);
            } catch (err) {
                setMessage({ type: 'error', text: 'Failed to load patients or doctors. Is the backend running?' });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            await api.post('appointments/', formData);
            setMessage({ type: 'success', text: 'Appointment booked successfully!' });
            setTimeout(() => navigate('/appointments'), 1500);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to book appointment. Please check all fields.' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-teal-500">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="text-lg font-medium">Loading form data...</p>
            </div>
        );
    }

    const inputClass = "themed-input w-full px-4 py-2 rounded-lg";
    const labelClass = "block text-sm font-medium themed-text-secondary mb-1";

    return (
        <div className="p-6 flex flex-col items-center w-full">
            <div className="themed-card w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-teal-500 p-6 flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-full text-white">
                        <Calendar size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Book Appointment</h2>
                        <p className="text-white/70 text-sm mt-0.5">Schedule a visit for a patient</p>
                    </div>
                </div>

                {message.text && (
                    <div className={`p-4 text-center font-medium text-sm ${message.type === 'success'
                        ? 'bg-green-50 text-green-700 border-b border-green-100'
                        : 'bg-red-50 text-red-700 border-b border-red-100'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className={labelClass}>Patient</label>
                        <select required name="patient" value={formData.patient} onChange={handleChange} className={inputClass}>
                            <option value="">Select Patient</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>Doctor</label>
                        <select required name="doctor" value={formData.doctor} onChange={handleChange} className={inputClass}>
                            <option value="">Select Doctor</option>
                            {doctors.map(d => (
                                <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name} ({d.specialization})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>Date & Time</label>
                        <input required type="datetime-local" name="appointment_date" value={formData.appointment_date} onChange={handleChange} className={inputClass} />
                    </div>

                    <div>
                        <label className={labelClass}>Reason for Visit</label>
                        <textarea required name="reason" value={formData.reason} onChange={handleChange} rows="3"
                            placeholder="Briefly describe the reason for this appointment..."
                            className={`${inputClass} resize-none`}></textarea>
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-4 themed-border border-t">
                        <button type="button" onClick={() => navigate('/appointments')}
                            className="themed-toggle-btn px-6 py-2.5 rounded-xl font-semibold">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting}
                            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold py-2.5 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2">
                            {submitting ? <><Loader2 className="animate-spin" size={20} /> Booking...</> : 'Book Appointment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookAppointment;
