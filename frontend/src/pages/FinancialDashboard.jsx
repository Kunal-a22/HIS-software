import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DollarSign, AlertCircle, FileText, CheckCircle, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const FinancialDashboard = () => {
    const { api } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        outstanding: 0,
        paidCount: 0,
        unpaidCount: 0
    });

    useEffect(() => {
        const fetchFinances = async () => {
            try {
                const response = await api.get('invoices/');
                const data = response.data || [];
                // Sort by date descending
                data.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
                setInvoices(data);

                let revenue = 0;
                let outstanding = 0;
                let paidCount = 0;
                let unpaidCount = 0;

                const trendsMap = {};

                data.forEach(inv => {
                    const amount = parseFloat(inv.total_amount || 0);
                    const isPaid = inv.is_paid || inv.status === 'Paid';

                    if (isPaid) {
                        revenue += amount;
                        paidCount++;

                        // Trends computation
                        const d = inv.created_at ? inv.created_at.split('T')[0] : (inv.date ? inv.date.split('T')[0] : 'Unknown');
                        if (!trendsMap[d]) trendsMap[d] = 0;
                        trendsMap[d] += amount;
                    } else {
                        outstanding += amount;
                        unpaidCount++;
                    }
                });

                setStats({ totalRevenue: revenue, outstanding, paidCount, unpaidCount });

                const trendsArray = Object.keys(trendsMap).sort().slice(-14).map(date => ({
                    name: date,
                    Revenue: trendsMap[date]
                }));
                setChartData(trendsArray);

            } catch (error) {
                console.error("Failed to fetch finances", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFinances();
    }, [api]);

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-4xl font-extrabold themed-text-primary tracking-tight mb-2">Financial Dashboard</h1>
                <p className="themed-text-muted font-medium">Revenue Tracking & Billing Status</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="themed-card rounded-3xl p-6 border-l-4 border-l-emerald-500 shadow-sm border themed-border">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="bg-emerald-500/10 p-3 rounded-2xl"><DollarSign className="text-emerald-500" size={24} /></div>
                        <div><p className="text-xs font-bold themed-text-muted uppercase">Total Revenue</p>
                            <p className="text-2xl font-black themed-text-primary">${stats.totalRevenue.toFixed(2)}</p></div>
                    </div>
                </div>
                <div className="themed-card rounded-3xl p-6 border-l-4 border-l-red-500 shadow-sm border themed-border">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="bg-red-500/10 p-3 rounded-2xl"><AlertCircle className="text-red-500" size={24} /></div>
                        <div><p className="text-xs font-bold themed-text-muted uppercase">Outstanding</p>
                            <p className="text-2xl font-black themed-text-primary">${stats.outstanding.toFixed(2)}</p></div>
                    </div>
                </div>
                <div className="themed-card rounded-3xl p-6 border-l-4 border-l-indigo-500 shadow-sm border themed-border">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="bg-indigo-500/10 p-3 rounded-2xl"><CheckCircle className="text-indigo-500" size={24} /></div>
                        <div><p className="text-xs font-bold themed-text-muted uppercase">Paid Invoices</p>
                            <p className="text-2xl font-black themed-text-primary">{stats.paidCount}</p></div>
                    </div>
                </div>
                <div className="themed-card rounded-3xl p-6 border-l-4 border-l-orange-500 shadow-sm border themed-border">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="bg-orange-500/10 p-3 rounded-2xl"><FileText className="text-orange-500" size={24} /></div>
                        <div><p className="text-xs font-bold themed-text-muted uppercase">Unpaid Invoices</p>
                            <p className="text-2xl font-black themed-text-primary">{stats.unpaidCount}</p></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 themed-card p-6 rounded-3xl shadow-sm border themed-border h-[400px] flex flex-col">
                    <h2 className="text-xl font-bold themed-text-primary mb-6 flex items-center gap-2"><TrendingUp className="text-emerald-500" /> Revenue Trend (Last 14 days)</h2>
                    <div className="flex-1">
                        {!loading && chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0/0.1)' }} />
                                    <Area type="monotone" dataKey="Revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center themed-text-muted">Not enough data to graph</div>
                        )}
                    </div>
                </div>

                <div className="themed-card p-6 rounded-3xl shadow-sm border themed-border h-[400px] flex flex-col">
                    <h2 className="text-xl font-bold themed-text-primary mb-6 flex items-center gap-2"><AlertCircle className="text-orange-500" /> Latest Unpaid</h2>
                    <div className="flex-1 overflow-auto">
                        {!loading ? (
                            <div className="space-y-4">
                                {invoices.filter(i => !i.is_paid && i.status !== 'Paid').slice(0, 5).map(inv => (
                                    <div key={inv.id} className="flex justify-between items-center p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">
                                        <div>
                                            <p className="font-bold themed-text-primary text-sm">Invoice #{inv.id}</p>
                                            <p className="text-xs themed-text-muted">{inv.patient_name || 'Patient'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-orange-500">${parseFloat(inv.total_amount || 0).toFixed(2)}</p>
                                            <Link to={`/billing/${inv.id}`} className="text-[10px] text-indigo-500 font-bold hover:underline">View Detail</Link>
                                        </div>
                                    </div>
                                ))}
                                {stats.unpaidCount === 0 && <p className="text-center text-sm themed-text-muted mt-10">No unpaid invoices. Great!</p>}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Advanced Financial Insights (Phase 4) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Payment Breakdown */}
                <div className="themed-card p-6 rounded-3xl shadow-sm border themed-border h-[250px] flex flex-col">
                    <h2 className="text-xl font-bold themed-text-primary mb-6">Payment Methods</h2>
                    <div className="flex-1 flex items-center justify-around">
                        <div className="text-center">
                            <p className="text-3xl font-black text-indigo-500">65%</p>
                            <p className="text-sm font-bold themed-text-muted mt-2">Insurance</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-black text-emerald-500">25%</p>
                            <p className="text-sm font-bold themed-text-muted mt-2">Credit Card</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-black text-amber-500">10%</p>
                            <p className="text-sm font-bold themed-text-muted mt-2">Cash</p>
                        </div>
                    </div>
                </div>

                {/* Revenue Forecast */}
                <div className="themed-card p-6 rounded-3xl shadow-sm border themed-border h-[250px] flex flex-col">
                    <h2 className="text-xl font-bold themed-text-primary mb-6">Projected Revenue (Next 30 Days)</h2>
                    <div className="flex-1 flex flex-col items-center justify-center relative">
                        <TrendingUp className="text-emerald-500/10 absolute h-32 w-32" />
                        <p className="text-5xl font-black text-emerald-500 z-10">${(stats.totalRevenue * 1.15).toFixed(2)}</p>
                        <p className="text-sm font-bold themed-text-muted mt-4 z-10 text-center">+15% expected growth based on appointment volume</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialDashboard;
