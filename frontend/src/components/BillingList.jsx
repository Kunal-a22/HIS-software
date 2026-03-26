import { useNavigate } from 'react-router-dom';

const BillingList = () => {
    const { api } = useAuth();
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    // ... rest of state

    // ... handlePayment effect/function

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold themed-text-primary flex items-center gap-3">
                        <CreditCard className="text-teal-500" /> Billing & Invoices
                    </h1>
                    <p className="themed-text-muted mt-1">Manage patient payments and billing history</p>
                </div>
                <button
                    onClick={() => navigate('/billing/create')}
                    className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 dark:shadow-none active:scale-95"
                >
                    <Plus size={20} /> Generate New Invoice
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by invoice ID or patient name..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="themed-input w-full pl-10 pr-4 py-3 rounded-xl shadow-sm"
                    />
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Filter className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="themed-input pl-9 pr-8 py-3 rounded-xl shadow-sm appearance-none"
                    >
                        <option value="">All Statuses</option>
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid</option>
                        <option value="Partially Paid">Partially Paid</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {error ? (
                <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                    <AlertCircle size={20} /> {error}
                </div>
            ) : loading ? (
                <div className="flex flex-col items-center justify-center p-20 text-teal-500">
                    <Loader2 className="w-12 h-12 animate-spin mb-4" />
                    <p className="text-lg font-medium">Loading invoices...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="themed-card p-12 rounded-2xl text-center">
                    <Receipt className="h-12 w-12 themed-text-muted mx-auto mb-4" />
                    <h3 className="text-xl font-semibold themed-text-secondary mb-2">No invoices found</h3>
                    <p className="themed-text-muted">Invoices are automatically created when appointments are completed.</p>
                </div>
            ) : (
                <div className="themed-card rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="themed-table-head themed-text-muted text-sm font-semibold tracking-wider">
                                    <th className="p-5">Invoice ID</th>
                                    <th className="p-5">Patient</th>
                                    <th className="p-5">Date</th>
                                    <th className="p-5">Total Amount</th>
                                    <th className="p-5">Status</th>
                                    <th className="p-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y themed-border">
                                {filtered.map(inv => (
                                    <tr key={inv.id} className="themed-table-row">
                                        <td className="p-5 font-mono text-sm themed-text-primary">
                                            #INV-{inv.id.toString().padStart(6, '0')}
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2 themed-text-primary font-medium">
                                                <User size={16} className="text-teal-500" />
                                                {inv.patient_name} {inv.patient_last_name}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="text-sm themed-text-primary font-medium">
                                                {format(new Date(inv.created_at), 'MMM d, yyyy')}
                                            </div>
                                            <div className="text-xs themed-text-muted">
                                                {format(new Date(inv.created_at), 'hh:mm a')}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="font-bold themed-text-primary">${inv.total_amount}</span>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(inv.status)}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {inv.status !== 'Paid' && (
                                                    <button
                                                        onClick={() => handlePayment(inv.id)}
                                                        className="p-1.5 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white transition-all"
                                                        title="Mark as Paid"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                                <button className="p-1.5 rounded-lg themed-toggle-btn themed-text-secondary hover:themed-text-primary transition-all" title="View Details">
                                                    <Eye size={18} />
                                                </button>
                                                <button className="p-1.5 rounded-lg themed-toggle-btn themed-text-secondary hover:themed-text-primary transition-all" title="Print Invoice">
                                                    <Printer size={18} />
                                                </button>
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

export default BillingList;
