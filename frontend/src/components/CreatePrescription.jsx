import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Pill, Plus, Trash2, Send, Loader2, AlertCircle, ClipboardList } from 'lucide-react';

const CreatePrescription = () => {
    const { api } = useAuth();
    const navigate = useNavigate();
    const { patientId } = useParams();
    const [patient, setPatient] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        patient: patientId || '',
        doctor: '',
        notes: '',
        medications: [
            { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
        ]
    });

    useEffect(() => {
        fetchInitialData();
    }, [patientId]);

    const fetchInitialData = async () => {
        try {
            const [docsRes, patRes] = await Promise.all([
                api.get('doctors/'),
                patientId ? api.get(`patients/${patientId}/`) : Promise.resolve(null)
            ]);
            setDoctors(docsRes.data);
            if (patRes) setPatient(patRes.data);
        } catch (err) {
            setError('Failed to load initial data.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMedication = () => {
        setFormData({
            ...formData,
            medications: [...formData.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
        });
    };

    const handleRemoveMedication = (index) => {
        const newMeds = formData.medications.filter((_, i) => i !== index);
        setFormData({ ...formData, medications: newMeds });
    };

    const handleMedChange = (index, field, value) => {
        const newMeds = [...formData.medications];
        newMeds[index][field] = value;
        setFormData({ ...formData, medications: newMeds });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.doctor) {
            setError('Please select a doctor.');
            return;
        }
        setSubmitting(true);
        try {
            await api.post('prescriptions/', formData);
            navigate(`/patients/${patientId}`);
        } catch (err) {
            setError('Failed to create prescription.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 text-teal-500">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-lg font-medium">Preparing prescription form...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="themed-card rounded-2xl shadow-xl overflow-hidden border themed-border">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-full text-white">
                        <ClipboardList size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Issue Prescription</h2>
                        <p className="text-white/70 text-sm mt-0.5">
                            {patient ? `Patient: ${patient.first_name} ${patient.last_name}` : 'Create new prescription'}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-700 flex items-center gap-2 font-medium">
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium themed-text-secondary mb-1">Prescribing Doctor</label>
                            <select
                                required
                                value={formData.doctor}
                                onChange={e => setFormData({ ...formData, doctor: e.target.value })}
                                className="themed-input w-full px-4 py-2 rounded-lg"
                            >
                                <option value="">Select Doctor</option>
                                {doctors.map(d => (
                                    <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name} ({d.specialization})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium themed-text-secondary mb-1">Additional Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                className="themed-input w-full px-4 py-2 rounded-lg h-[42px] resize-none"
                                placeholder="Dietary restrictions, follow-up info, etc."
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b themed-border pb-2">
                            <h3 className="text-lg font-semibold themed-text-primary flex items-center gap-2">
                                <Pill size={20} className="text-purple-500" /> Medications
                            </h3>
                            <button
                                type="button"
                                onClick={handleAddMedication}
                                className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-indigo-50 transition-all"
                            >
                                <Plus size={16} /> Add Medicine
                            </button>
                        </div>

                        {formData.medications.map((med, index) => (
                            <div key={index} className="p-4 rounded-xl themed-border border bg-opacity-50 themed-card space-y-4 relative group">
                                {formData.medications.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveMedication(index)}
                                        className="absolute top-2 right-2 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="lg:col-span-2">
                                        <label className="block text-[10px] uppercase tracking-wider font-bold themed-text-muted mb-1">Medicine Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={med.name}
                                            onChange={e => handleMedChange(index, 'name', e.target.value)}
                                            className="themed-input w-full px-3 py-1.5 rounded-lg text-sm"
                                            placeholder="e.g. Paracetamol"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-wider font-bold themed-text-muted mb-1">Dosage</label>
                                        <input
                                            required
                                            type="text"
                                            value={med.dosage}
                                            onChange={e => handleMedChange(index, 'dosage', e.target.value)}
                                            className="themed-input w-full px-3 py-1.5 rounded-lg text-sm"
                                            placeholder="e.g. 500mg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-wider font-bold themed-text-muted mb-1">Frequency</label>
                                        <input
                                            required
                                            type="text"
                                            value={med.frequency}
                                            onChange={e => handleMedChange(index, 'frequency', e.target.value)}
                                            className="themed-input w-full px-3 py-1.5 rounded-lg text-sm"
                                            placeholder="e.g. Twice daily"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-wider font-bold themed-text-muted mb-1">Duration</label>
                                        <input
                                            required
                                            type="text"
                                            value={med.duration}
                                            onChange={e => handleMedChange(index, 'duration', e.target.value)}
                                            className="themed-input w-full px-3 py-1.5 rounded-lg text-sm"
                                            placeholder="e.g. 5 days"
                                        />
                                    </div>
                                    <div className="lg:col-span-3">
                                        <label className="block text-[10px] uppercase tracking-wider font-bold themed-text-muted mb-1">Special Instructions</label>
                                        <input
                                            type="text"
                                            value={med.instructions}
                                            onChange={e => handleMedChange(index, 'instructions', e.target.value)}
                                            className="themed-input w-full px-3 py-1.5 rounded-lg text-sm"
                                            placeholder="e.g. After meals"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-6 mt-6 themed-border border-t">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="themed-toggle-btn px-6 py-2 rounded-xl font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-2 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2"
                        >
                            {submitting ? <><Loader2 className="animate-spin" size={20} /> Issuing...</> : <><Send size={20} /> Issue Prescription</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePrescription;
