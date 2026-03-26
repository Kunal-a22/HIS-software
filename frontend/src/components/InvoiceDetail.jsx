import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { Receipt, Printer, ArrowLeft, Loader2, AlertCircle, Calendar, User, CreditCard, Banknote } from 'lucide-react';
import { format } from 'date-fns';

const InvoiceDetail = () => {
    const { api } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchInvoiceDetail();
    }, [id]);

    const fetchInvoiceDetail = async () => {
        try {
            const response = await api.get(`invoices/${id}/`);
            setInvoice(response.data);
        } catch (err) {
            setError('Failed to load invoice details.');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 text-teal-500">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-lg font-medium">Loading invoice details...</p>
        </div>
    );

    if (error || !invoice) return (
        <div className="max-w-4xl mx-auto p-6 text-center">
            <div className="themed-card p-12 rounded-2xl border themed-border">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold themed-text-primary mb-2">Invoice Not Found</h3>
                <p className="themed-text-muted mb-6">{error || 'The requested invoice could not be located.'}</p>
                <button
                    onClick={() => navigate('/billing')}
                    className="flex items-center gap-2 mx-auto px-6 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all"
                >
                    <ArrowLeft size={18} /> Back to Billing
                </button>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between no-print">
                <button
                    onClick={() => navigate('/billing')}
                    className="themed-toggle-btn p-2 rounded-xl text-teal-600 font-bold flex items-center gap-2"
                >
                    <ArrowLeft size={20} /> Back to List
                </button>
                <button
                    onClick={handlePrint}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                    <Printer size={20} /> Print Invoice
                </button>
            </div>

            <div className="themed-card rounded-3xl shadow-2xl overflow-hidden border themed-border bg-white printable-invoice">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-10 text-white flex flex-col md:flex-row justify-between items-start gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-teal-500 p-2 rounded-xl">
                                <Receipt size={32} />
                            </div>
                            <h1 className="text-4xl font-black tracking-tight">INVOICE</h1>
                        </div>
                        <p className="text-gray-400 font-mono text-lg font-bold">#INV-{invoice.id.toString().padStart(6, '0')}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-black text-teal-400">HIS Hospital</h2>
                        <p className="text-gray-400 text-sm mt-1">123 Health Avenue, Medical Square</p>
                        <p className="text-gray-400 text-sm italic">contact@his-system.com</p>
                    </div>
                </div>

                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12 border-b themed-border bg-gray-50/50">
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-teal-600 mb-4">Patient Information</p>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-600 font-black text-xl">
                                {invoice.patient_last_name[0]}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black themed-text-primary capitalize">{invoice.patient_name} {invoice.patient_last_name}</h3>
                                <p className="themed-text-muted font-medium">Patient ID: PAT-{invoice.patient.toString().padStart(4, '0')}</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-teal-600 mb-2">Date Issued</p>
                            <p className="themed-text-primary font-bold">{format(new Date(invoice.created_at), 'MMMM dd, yyyy')}</p>
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-teal-600 mb-2">Due Date</p>
                            <p className="themed-text-primary font-bold">{invoice.due_date ? format(new Date(invoice.due_date), 'MMMM dd, yyyy') : 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-teal-600 mb-2">Payment Status</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-black border ${invoice.status === 'Paid' ? 'bg-green-100 text-green-700 border-green-200' :
                                    invoice.status === 'Unpaid' ? 'bg-red-100 text-red-700 border-red-200' :
                                        'bg-yellow-100 text-yellow-700 border-yellow-200'
                                }`}>
                                {invoice.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 themed-border">
                                <th className="py-4 font-black uppercase tracking-widest text-xs themed-text-muted">Description</th>
                                <th className="py-4 font-black uppercase tracking-widest text-xs themed-text-muted text-center w-24">Qty</th>
                                <th className="py-4 font-black uppercase tracking-widest text-xs themed-text-muted text-right w-32">Unit Price</th>
                                <th className="py-4 font-black uppercase tracking-widest text-xs themed-text-muted text-right w-32">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y themed-border">
                            {invoice.items.map((item) => (
                                <tr key={item.id}>
                                    <td className="py-6 themed-text-primary font-bold">{item.description}</td>
                                    <td className="py-6 themed-text-primary font-medium text-center">{item.quantity}</td>
                                    <td className="py-6 themed-text-primary font-medium text-right">${parseFloat(item.unit_price).toFixed(2)}</td>
                                    <td className="py-6 themed-text-primary font-black text-right">${parseFloat(item.amount).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-12 flex justify-end">
                        <div className="w-full md:w-80 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="themed-text-muted font-bold uppercase tracking-wider">Subtotal</span>
                                <span className="themed-text-primary font-bold">${parseFloat(invoice.total_amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b themed-border pb-4">
                                <span className="themed-text-muted font-bold uppercase tracking-wider">Paid Amount</span>
                                <span className="text-green-600 font-bold">-${parseFloat(invoice.paid_amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-xl font-black themed-text-primary">Total Balance</span>
                                <span className="text-3xl font-black text-teal-600">${(parseFloat(invoice.total_amount) - parseFloat(invoice.paid_amount)).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {invoice.notes && (
                        <div className="mt-12 p-6 rounded-2xl bg-gray-50 border themed-border">
                            <p className="text-xs font-black uppercase tracking-widest text-teal-600 mb-2">Additional Notes</p>
                            <p className="themed-text-secondary italic">{invoice.notes}</p>
                        </div>
                    )}
                </div>

                <div className="p-10 bg-gray-900 text-white/50 text-xs text-center font-bold tracking-widest uppercase">
                    Thank you for choosing HIS Hospital. Please pay within 7 days of due date.
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; padding: 0 !important; }
                    .printable-invoice { box-shadow: none !important; border: 1px solid #eee !important; width: 100% !important; margin: 0 !important; }
                    .themed-card { background: white !important; }
                    .themed-text-primary { color: black !important; }
                    .themed-text-muted { color: #666 !important; }
                    .bg-gray-900 { background: #111 !important; color: white !important; }
                    .bg-gray-50\\/50 { background: #f9f9f9 !important; }
                }
            `}</style>
        </div>
    );
};

export default InvoiceDetail;
