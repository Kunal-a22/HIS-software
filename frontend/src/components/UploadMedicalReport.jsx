import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Pill, Plus, Trash2, Send, Loader2, AlertCircle, FileText, Upload } from 'lucide-react';

const UploadMedicalReport = () => {
    const { api } = useAuth();
    const navigate = useNavigate();
    const { patientId } = useParams();
    const [patient, setPatient] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        doctor: '',
        disease: '',
        symptoms: '',
        illness_duration: '',
        medicines: [
            { name: '', timing: '', condition: '', frequency: '' }
        ]
    });
    const [file, setFile] = useState(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [docsRes, patRes] = await Promise.all([
                    api.get('doctors/'),
                    api.get(`patients/${patientId}/`)
                ]);
                setDoctors(docsRes.data);
                setPatient(patRes.data);
            } catch (err) {
                setError('Failed to load initial data.');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [patientId, api]);

    const handleAddMedicine = () => {
        setFormData({
            ...formData,
            medicines: [...formData.medicines, { name: '', timing: '', condition: '', frequency: '' }]
        });
    };

    const handleRemoveMedicine = (index) => {
        const newMeds = formData.medicines.filter((_, i) => i !== index);
        setFormData({ ...formData, medicines: newMeds });
    };

    const handleMedChange = (index, field, value) => {
        const newMeds = [...formData.medicines];
        newMeds[index][field] = value;
        setFormData({ ...formData, medicines: newMeds });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        const uploadData = new FormData();
        uploadData.append('patient', patientId);
        if (formData.doctor) uploadData.append('doctor', formData.doctor);
        uploadData.append('disease', formData.disease);
        uploadData.append('symptoms', formData.symptoms);
        uploadData.append('illness_duration', formData.illness_duration);

        // Filter out empty medicines
        const validMedicines = formData.medicines.filter(m => m.name.trim() !== '');
        uploadData.append('medicines', JSON.stringify(validMedicines));

        if (file) {
            uploadData.append('report_file', file);
        }

        try {
            await api.post('medical-reports/', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            navigate(`/patients/${patientId}`);
        } catch (err) {
            setError('Failed to upload medical report.');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 text-teal-500">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-lg font-medium">Preparing report form...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-6 pb-12">
            <div className="themed-card rounded-2xl shadow-xl overflow-hidden border themed-border">
                <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-6 flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-full text-white">
                        <FileText size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Upload Medical Report</h2>
                        <p className="text-white/80 text-sm mt-0.5">
                            {patient ? `Patient: ${patient.first_name} ${patient.last_name}` : ''}
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
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold themed-text-secondary mb-1">Attending Doctor (Optional)</label>
                            <select
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
                            <label className="block text-sm font-bold themed-text-secondary mb-1">Disease / Diagnosis</label>
                            <input
                                required
                                type="text"
                                value={formData.disease}
                                onChange={e => setFormData({ ...formData, disease: e.target.value })}
                                className="themed-input w-full px-4 py-2 rounded-lg"
                                placeholder="e.g. Viral Fever"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold themed-text-secondary mb-1">Illness Duration</label>
                            <input
                                required
                                type="text"
                                value={formData.illness_duration}
                                onChange={e => setFormData({ ...formData, illness_duration: e.target.value })}
                                className="themed-input w-full px-4 py-2 rounded-lg"
                                placeholder="e.g. Since 3 days"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold themed-text-secondary mb-1">Symptoms</label>
                            <textarea
                                required
                                value={formData.symptoms}
                                onChange={e => setFormData({ ...formData, symptoms: e.target.value })}
                                className="themed-input w-full px-4 py-2 rounded-lg h-24 resize-none"
                                placeholder="Describe the symptoms..."
                            />
                        </div>

                        <div className="md:col-span-2 p-4 border border-teal-100 bg-teal-50/30 rounded-xl rounded-lg">
                            <label className="block text-sm font-bold text-teal-800 mb-2 flex items-center gap-2">
                                <Upload size={18} /> Attach File Report (Optional)
                            </label>
                            <input
                                type="file"
                                onChange={e => setFile(e.target.files[0])}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t themed-border">
                        <div className="flex items-center justify-between pb-2">
                            <h3 className="text-lg font-bold text-emerald-600 flex items-center gap-2">
                                <Pill size={20} /> Prescribed Medicines
                            </h3>
                            <button
                                type="button"
                                onClick={handleAddMedicine}
                                className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-emerald-50 transition-all"
                            >
                                <Plus size={16} /> Add Medicine
                            </button>
                        </div>

                        {formData.medicines.map((med, index) => (
                            <div key={index} className="p-4 rounded-xl themed-border border bg-opacity-50 themed-card space-y-4 relative group">
                                {formData.medicines.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveMedicine(index)}
                                        className="absolute top-2 right-2 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="lg:col-span-1">
                                        <label className="block text-[10px] uppercase tracking-wider font-bold themed-text-muted mb-1">Medicine Name</label>
                                        <input
                                            required={index === 0}
                                            type="text"
                                            value={med.name}
                                            onChange={e => handleMedChange(index, 'name', e.target.value)}
                                            className="themed-input w-full px-3 py-1.5 rounded-lg text-sm"
                                            placeholder="e.g. Paracetamol"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-wider font-bold themed-text-muted mb-1">Frequency</label>
                                        <input
                                            required={med.name !== ''}
                                            type="text"
                                            value={med.frequency}
                                            onChange={e => handleMedChange(index, 'frequency', e.target.value)}
                                            className="themed-input w-full px-3 py-1.5 rounded-lg text-sm"
                                            placeholder="e.g. 2 times a day"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-wider font-bold themed-text-muted mb-1">Timing</label>
                                        <input
                                            required={med.name !== ''}
                                            type="text"
                                            value={med.timing}
                                            onChange={e => handleMedChange(index, 'timing', e.target.value)}
                                            className="themed-input w-full px-3 py-1.5 rounded-lg text-sm"
                                            placeholder="e.g. Morning, Night"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-wider font-bold themed-text-muted mb-1">Condition</label>
                                        <input
                                            required={med.name !== ''}
                                            type="text"
                                            value={med.condition}
                                            onChange={e => handleMedChange(index, 'condition', e.target.value)}
                                            className="themed-input w-full px-3 py-1.5 rounded-lg text-sm"
                                            placeholder="e.g. Empty Stomach"
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
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-2 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2"
                        >
                            {submitting ? <><Loader2 className="animate-spin" size={20} /> Uploading...</> : <><Send size={20} /> Save Report</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadMedicalReport;
