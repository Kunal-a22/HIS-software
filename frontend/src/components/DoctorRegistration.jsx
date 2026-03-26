import React, { useState } from 'react';
import { Stethoscope, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SPECIALIZATIONS = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology',
    'Dermatology', 'Oncology', 'Psychiatry', 'Radiology', 'General Practice',
    'Emergency Medicine', 'Anesthesiology', 'Ophthalmology', 'ENT', 'Urology',
    'Nephrology', 'Gastroenterology', 'Endocrinology', 'Other',
];

const DoctorRegistration = () => {
    const { api } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', specialization: 'General Practice',
        license_number: '', gender: 'M', phone_number: '', email: '',
        years_of_experience: 0, availability: '', bio: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await api.post('doctors/', formData);
            setMessage({ type: 'success', text: 'Doctor registered successfully! Redirecting...' });
            setTimeout(() => navigate('/doctors'), 1500);
        } catch (err) {
            const errData = err.response?.data;
            const msg = errData
                ? Object.values(errData).flat().join('. ')
                : 'Failed to register doctor. Please check your inputs.';
            setMessage({ type: 'error', text: msg });
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "themed-input w-full px-4 py-2 rounded-lg";
    const labelClass = "block text-sm font-medium themed-text-secondary mb-1";

    return (
        <div className="p-6 flex flex-col items-center w-full">
            <div className="themed-card w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-teal-500 p-6 flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-full text-white">
                        <Stethoscope size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Register Doctor</h2>
                        <p className="text-white/70 text-sm mt-0.5">Add a new doctor to the system</p>
                    </div>
                </div>

                {message.text && (
                    <div className={`p-4 text-center font-medium text-sm ${message.type === 'success'
                        ? 'bg-green-50 text-green-700 border-b border-green-100'
                        : 'bg-red-50 text-red-700 border-b border-red-100'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Personal Information */}
                    <div>
                        <h3 className="text-lg font-semibold themed-text-primary mb-4 pb-2 themed-border border-b">
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>First Name</label>
                                <input required type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Last Name</label>
                                <input required type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                    <option value="O">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Professional Details */}
                    <div>
                        <h3 className="text-lg font-semibold themed-text-primary mb-4 pb-2 themed-border border-b">
                            Professional Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Specialization</label>
                                <select name="specialization" value={formData.specialization} onChange={handleChange} className={inputClass}>
                                    {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>License Number</label>
                                <input required type="text" name="license_number" value={formData.license_number} onChange={handleChange}
                                    placeholder="e.g. MED-2024-001" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Years of Experience</label>
                                <input required type="number" name="years_of_experience" min="0" max="60"
                                    value={formData.years_of_experience} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Availability</label>
                                <input type="text" name="availability" value={formData.availability} onChange={handleChange}
                                    placeholder="e.g. Mon–Fri 9am–5pm" className={inputClass} />
                            </div>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold themed-text-primary mb-4 pb-2 themed-border border-b">
                            Contact Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Phone Number</label>
                                <input required type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Email Address</label>
                                <input required type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} />
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <h3 className="text-lg font-semibold themed-text-primary mb-4 pb-2 themed-border border-b">
                            Biography (Optional)
                        </h3>
                        <textarea name="bio" value={formData.bio} onChange={handleChange} rows="4"
                            placeholder="Brief professional biography, research interests, certifications..."
                            className={`${inputClass} resize-none`}></textarea>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 pt-4 themed-border border-t">
                        <button type="button" onClick={() => navigate('/doctors')}
                            className="themed-toggle-btn px-6 py-2.5 rounded-xl font-semibold">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-2.5 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2">
                            {loading ? <><Loader2 className="animate-spin" size={20} /> Registering...</> : 'Register Doctor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DoctorRegistration;
