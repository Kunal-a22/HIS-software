import React, { useState } from 'react';
import { UserPlus, User, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PatientRegistration = () => {
    const { api } = useAuth();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: 'M',
        phone_number: '',
        email: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        medical_history_notes: ''
    });

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await api.post('patients/', formData);
            setMessage({ type: 'success', text: 'Patient registered successfully! Redirecting...' });
            setTimeout(() => navigate('/patients'), 1500);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to register patient. Please check your inputs.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 flex flex-col items-center justify-center w-full">
            <div className="themed-card w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-teal-500 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-full text-white">
                        <UserPlus size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Patient Registration</h2>
                </div>

                {message.text && (
                    <div className={`p-4 text-center font-medium text-sm ${message.type === 'success'
                        ? 'bg-green-50 text-green-700 border-b border-green-100'
                        : 'bg-red-50 text-red-700 border-b border-red-100'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Personal Info */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold themed-text-primary flex items-center pb-2 themed-border border-b">
                                <User size={20} className="mr-2 text-teal-500" /> Personal Information
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium themed-text-secondary mb-1">First Name</label>
                                    <input required type="text" name="first_name" value={formData.first_name} onChange={handleChange}
                                        className="themed-input w-full px-4 py-2 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium themed-text-secondary mb-1">Last Name</label>
                                    <input required type="text" name="last_name" value={formData.last_name} onChange={handleChange}
                                        className="themed-input w-full px-4 py-2 rounded-lg" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium themed-text-secondary mb-1">Date of Birth</label>
                                    <input required type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange}
                                        className="themed-input w-full px-4 py-2 rounded-lg [color-scheme:light] dark:[color-scheme:dark]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium themed-text-secondary mb-1">Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange}
                                        className="themed-input w-full px-4 py-2 rounded-lg">
                                        <option value="M">Male</option>
                                        <option value="F">Female</option>
                                        <option value="O">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium themed-text-secondary mb-1">Address</label>
                                <textarea required name="address" value={formData.address} onChange={handleChange} rows="2"
                                    className="themed-input w-full px-4 py-2 rounded-lg resize-none"></textarea>
                            </div>
                        </div>

                        {/* Contact & Medical */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold themed-text-primary flex items-center pb-2 themed-border border-b">
                                <UserPlus size={20} className="mr-2 text-teal-500" /> Contact & Details
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium themed-text-secondary mb-1">Phone Number</label>
                                    <input required type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange}
                                        className="themed-input w-full px-4 py-2 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium themed-text-secondary mb-1">Email (Optional)</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                                        className="themed-input w-full px-4 py-2 rounded-lg" />
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            <div className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                <h4 className="text-sm font-bold text-red-500">Emergency Contact</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold themed-text-muted mb-1">Name</label>
                                        <input required type="text" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange}
                                            className="themed-input w-full px-3 py-1.5 rounded-md" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold themed-text-muted mb-1">Phone</label>
                                        <input required type="tel" name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange}
                                            className="themed-input w-full px-3 py-1.5 rounded-md" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium themed-text-secondary mb-1">Medical History Notes</label>
                                <textarea name="medical_history_notes" value={formData.medical_history_notes} onChange={handleChange} rows="3"
                                    placeholder="Allergies, chronic conditions..."
                                    className="themed-input w-full px-4 py-2 rounded-lg resize-none"></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 themed-border border-t flex justify-end">
                        <button type="submit" disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2">
                            {loading ? (
                                <><Loader2 className="animate-spin" size={20} /> Registering...</>
                            ) : 'Register Patient'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PatientRegistration;
