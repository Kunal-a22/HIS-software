import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Send, Loader2, AlertCircle, Receipt, User, Calendar, DollarSign } from 'lucide-react';

const CreateInvoice = () => {
    const { api } = useAuth();
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        patient: '',
        appointment: '',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Unpaid',
        items: [
            { description: '', quantity: 1, unit_price: '' }
        ]
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [patientsRes, appointmentsRes] = await Promise.all([
                api.get('patients/'),
                api.get('appointments/')
            ]);
            setPatients(patientsRes.data);
            setAppointments(appointmentsRes.data);
        } catch (err) {
            setError('Failed to load patients and appointments.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { description: '', quantity: 1, unit_price: '' }]
        });
    };

    const handleRemoveItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const calculateTotal = () => {
        return formData.items.reduce((total, item) => {
            const price = parseFloat(item.unit_price) || 0;
            const qty = parseInt(item.quantity) || 0;
            return total + (price * qty);
        }, 0).toFixed(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.patient) {
            setError('Please select a patient.');
            return;
        }
        if (formData.items.some(item => !item.description || !item.unit_price)) {
            setError('Please fill in all item descriptions and prices.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                appointment: formData.appointment || null
            };
            await api.post('invoices/', payload);
            navigate('/billing');
        } catch (err) {
            setError('Failed to create invoice. Please check the data and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 text-teal-500">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-lg font-medium">Preparing invoice form...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="themed-card rounded-2xl shadow-xl overflow-hidden border themed-border">
                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-full text-white">
                        <Receipt size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Generate Invoice</h2>
                        <p className="text-white/70 text-sm mt-0.5">Create a new bill for patient services</p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-700 flex items-center gap-2 font-medium border-b border-red-100">
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium themed-text-secondary mb-1 flex items-center gap-2">
                                <User size={14} className="text-teal-500" /> Patient
                            </label>
                            <select
                                required
                                value={formData.patient}
                                onChange={e => setFormData({ ...formData, patient: e.target.value })}
                                className="themed-input w-full px-4 py-2 rounded-lg"
                            >
                                <option value="">Select Patient</option>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium themed-text-secondary mb-1 flex items-center gap-2">
                                <Calendar size={14} className="text-teal-500" /> Appointment (Optional)
                            </label>
                            <select
                                value={formData.appointment}
                                onChange={e => setFormData({ ...formData, appointment: e.target.value })}
                                className="themed-input w-full px-4 py-2 rounded-lg"
                            >
                                <option value="">No specific appointment</option>
                                {appointments.filter(a => a.patient.toString() === formData.patient).map(a => (
                                    <option key={a.id} value={a.id}>
                                        {new Date(a.appointment_date).toLocaleDateString()} - {a.reason.substring(0, 30)}...
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium themed-text-secondary mb-1">Due Date</label>
                            <input
                                type="date"
                                value={formData.due_date}
                                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                className="themed-input w-full px-4 py-2 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium themed-text-secondary mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="themed-input w-full px-4 py-2 rounded-lg"
                            >
                                <option value="Unpaid">Unpaid</option>
                                <option value="Partially Paid">Partially Paid</option>
                                <option value="Paid">Paid</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b themed-border pb-2">
                            <h3 className="text-lg font-semibold themed-text-primary flex items-center gap-2">
                                <DollarSign size={20} className="text-teal-500" /> Invoice Items
                            </h3>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-teal-50 transition-all border border-teal-200"
                            >
                                <Plus size={16} /> Add Item
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 rounded-xl themed-border border bg-opacity-50 themed-card relative group">
                                    <div className="md:col-span-6">
                                        <label className="block text-[10px] uppercase tracking-wider font-bold themed-text-muted mb-1">Description</label>
                                        <input
                                            required
                                            type="text"
                                            value={item.description}
                                            onChange={e => handleItemChange(index, 'description', e.target.value)}
                                            className="themed-input w-full px-3 py-2 rounded-lg text-sm"
                                            placeholder="Consultation, Lab Test, etc."
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] uppercase tracking-wider font-bold themed-text-muted mb-1">Qty</label>
                                        <input
                                            required
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                            className="themed-input w-full px-3 py-2 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="block text-[10px] uppercase tracking-wider font-bold themed-text-muted mb-1">Unit Price ($)</label>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            value={item.unit_price}
                                            onChange={e => handleItemChange(index, 'unit_price', e.target.value)}
                                            className="themed-input w-full px-3 py-2 rounded-lg text-sm"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="md:col-span-1 flex justify-center pb-2">
                                        {formData.items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="Remove Item"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t themed-border">
                        <div className="text-center md:text-left">
                            <p className="text-sm themed-text-muted font-medium mb-1 uppercase tracking-widest">Total Invoice Amount</p>
                            <p className="text-4xl font-black themed-text-primary tabular-nums">${calculateTotal()}</p>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="flex-1 md:flex-none themed-toggle-btn px-8 py-3 rounded-xl font-bold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 md:flex-none bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold px-10 py-3 rounded-xl shadow-lg shadow-teal-100 dark:shadow-none transition-all flex items-center justify-center gap-2"
                            >
                                {submitting ? <><Loader2 className="animate-spin" size={20} /> Generating...</> : <><Send size={20} /> Create Invoice</>}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateInvoice;
