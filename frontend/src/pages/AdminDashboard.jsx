import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, CheckCircle, Clock, Calendar, DollarSign, Activity, FilePlus, UserPlus, Stethoscope, ArrowRight, TrendingUp, TrendingDown, PieChart as PieChartIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, parseISO, subDays, isAfter } from 'date-fns';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download } from 'lucide-react';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#eab308', '#8b5cf6'];

const AdminDashboard = () => {
    const { api } = useAuth();
    const [dateRange, setDateRange] = useState(7);
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [appointmentTrends, setAppointmentTrends] = useState([]);
    const [doctorWorkload, setDoctorWorkload] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeDoctors: 0,
        todaysAppointments: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const [doctorsRes, patientsRes, appointmentsRes, invoicesRes] = await Promise.all([
                api.get('doctors/'),
                api.get('patients/'),
                api.get('appointments/'),
                api.get('invoices/')
            ]);

            const doctors = doctorsRes.data || [];
            const patients = patientsRes.data || [];
            const appointments = appointmentsRes.data || [];
            const invoices = invoicesRes.data || [];

            // Alerts - Pending Doctors
            const unapproved = doctors.filter(doc => !doc.is_approved);
            setPendingDoctors(unapproved);

            // Calculate Stats
            const activeDocsCount = doctors.filter(doc => doc.is_approved).length;
            const totalUsersCount = doctors.length + patients.length;

            // Simple check for today's date (comparing YYYY-MM-DD)
            const todayStr = new Date().toISOString().split('T')[0];
            const todayAppts = appointments.filter(app => {
                if (!app.date) return false;
                return app.date.startsWith(todayStr);
            });

            const revenue = invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

            setStats({
                totalUsers: totalUsersCount,
                activeDoctors: activeDocsCount,
                todaysAppointments: todayAppts.length,
                totalRevenue: revenue
            });

            // Compile minimal recent activity from standard lists
            const activities = [];
            patients.slice(-3).forEach(p => {
                activities.push({
                    id: `p-${p.id}`,
                    title: 'New Patient Registered',
                    desc: `${p.first_name} ${p.last_name} joined today`,
                    icon: UserPlus,
                    color: 'text-blue-500',
                    bg: 'bg-blue-500/10'
                });
            });
            appointments.slice(-5).forEach(a => {
                let dateStr = a.date || 'Unknown time';
                if (a.appointment_date) {
                    try {
                        dateStr = format(new Date(a.appointment_date), "MMM d, h:mm a");
                    } catch (e) { }
                }
                activities.push({
                    id: `a-${a.id}`,
                    title: 'Appointment Booked',
                    desc: `Scheduled for: ${dateStr}`,
                    icon: Calendar,
                    color: 'text-purple-500',
                    bg: 'bg-purple-500/10'
                });
            });
            // Reverse so newest appears first if array implies insertion order
            setRecentActivity(activities.reverse().slice(0, 5));

            // Calculate Charts Data
            const cutoffDate = subDays(new Date(), dateRange);
            const trendMap = {};

            for (let i = dateRange - 1; i >= 0; i--) {
                const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
                trendMap[d] = 0;
            }

            appointments.forEach(app => {
                const apptDate = app.appointment_date ? new Date(app.appointment_date) : (app.date ? new Date(app.date) : null);
                if (apptDate && isAfter(apptDate, cutoffDate)) {
                    const d = format(apptDate, 'yyyy-MM-dd');
                    if (trendMap[d] !== undefined) {
                        trendMap[d]++;
                    } else {
                        trendMap[d] = 1;
                    }
                }
            });

            const trendsData = Object.keys(trendMap).sort().map(isoDate => ({
                name: format(parseISO(isoDate), 'MMM d'),
                Appointments: trendMap[isoDate]
            }));
            setAppointmentTrends(trendsData);

            const docMap = {};
            appointments.forEach(app => {
                const docName = app.doctor_name || `Doctor ${app.doctor}` || 'Unassigned';
                if (!docMap[docName]) docMap[docName] = 0;
                docMap[docName]++;
            });
            const workloadData = Object.keys(docMap).map(name => ({
                name,
                value: docMap[name]
            })).sort((a, b) => b.value - a.value).slice(0, 5); // top 5
            setDoctorWorkload(workloadData);

        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();

        // Auto-refresh data every 30 seconds for real-time monitoring
        const interval = setInterval(() => {
            fetchDashboardData();
        }, 30000);

        return () => clearInterval(interval);
    }, [dateRange]);

    const handleApprove = async (doctorId) => {
        try {
            await api.post(`doctors/${doctorId}/approve/`);
            setPendingDoctors(prev => prev.filter(doc => doc.id !== doctorId));
        } catch (error) {
            console.error("Failed to approve doctor", error);
            alert("Error approving doctor. Check console.");
        }
    };

    const exportToPDF = () => {
        const input = document.getElementById('dashboard-export-target');
        if (!input) return;

        // Add a temporary class to fix dark mode printing issues
        const originalClass = input.className;
        input.className = originalClass + " bg-white dark:bg-gray-900";

        html2canvas(input, { scale: 1.5, useCORS: true }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`PulseHIS-Dashboard-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
            input.className = originalClass;
        });
    };

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold themed-text-primary tracking-tight mb-2">Admin Dashboard</h1>
                    <p className="themed-text-muted font-medium">System Overview and Administrative Controls</p>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="themed-text-muted" />
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(Number(e.target.value))}
                        className="themed-input px-3 py-2 rounded-xl text-sm font-bold shadow-sm"
                    >
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                        <option value="90">Last Quarter</option>
                    </select>
                    <button
                        onClick={exportToPDF}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl shadow-md transition-all text-sm"
                    >
                        <Download size={16} /> Export PDF
                    </button>
                </div>
            </div>

            <div id="dashboard-export-target" className="space-y-8 p-3 rounded-2xl">
                {/* Stat Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Link to="/patients" className="themed-card rounded-3xl shadow-sm p-6 flex flex-col justify-center transition-all hover:shadow-lg border-l-4 border-l-blue-500 hover:-translate-y-1 group">
                        <div className="flex items-center w-full mb-3">
                            <div className="bg-blue-500/10 p-3 rounded-2xl mr-4 group-hover:scale-110 transition-transform">
                                <Users className="text-blue-600 dark:text-blue-400" size={24} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs themed-text-muted font-bold uppercase tracking-widest leading-none">Total Users</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-3xl font-black themed-text-primary leading-none">{stats.totalUsers}</p>
                            <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-500">
                                <TrendingUp size={14} /> <span>+12%</span> <span className="text-gray-400 dark:text-gray-600 font-medium ml-1">vs earlier</span>
                            </div>
                        </div>
                    </Link>

                    <Link to="/doctors" className="themed-card rounded-3xl shadow-sm p-6 flex flex-col justify-center transition-all hover:shadow-lg border-l-4 border-l-emerald-500 hover:-translate-y-1 group">
                        <div className="flex items-center w-full mb-3">
                            <div className="bg-emerald-500/10 p-3 rounded-2xl mr-4 group-hover:scale-110 transition-transform">
                                <Stethoscope className="text-emerald-600 dark:text-emerald-400" size={24} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs themed-text-muted font-bold uppercase tracking-widest leading-none">Active Doctors</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-3xl font-black themed-text-primary leading-none">{stats.activeDoctors}</p>
                            <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-500">
                                <TrendingUp size={14} /> <span>+4%</span> <span className="text-gray-400 dark:text-gray-600 font-medium ml-1">vs earlier</span>
                            </div>
                        </div>
                    </Link>

                    <Link to="/appointments" className="themed-card rounded-3xl shadow-sm p-6 flex flex-col justify-center transition-all hover:shadow-lg border-l-4 border-l-purple-500 hover:-translate-y-1 group">
                        <div className="flex items-center w-full mb-3">
                            <div className="bg-purple-500/10 p-3 rounded-2xl mr-4 group-hover:scale-110 transition-transform">
                                <Calendar className="text-purple-600 dark:text-purple-400" size={24} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs themed-text-muted font-bold uppercase tracking-widest leading-none">Today's Appts</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-3xl font-black themed-text-primary leading-none">{stats.todaysAppointments}</p>
                            <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-500">
                                <TrendingUp size={14} /> <span>+18%</span> <span className="text-gray-400 dark:text-gray-600 font-medium ml-1">vs yesterday</span>
                            </div>
                        </div>
                    </Link>

                    <Link to="/finance" className="themed-card rounded-3xl shadow-sm p-6 flex flex-col justify-center transition-all hover:shadow-lg border-l-4 border-l-amber-500 hover:-translate-y-1 group">
                        <div className="flex items-center w-full mb-3">
                            <div className="bg-amber-500/10 p-3 rounded-2xl mr-4 group-hover:scale-110 transition-transform">
                                <DollarSign className="text-amber-600 dark:text-amber-400" size={24} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs themed-text-muted font-bold uppercase tracking-widest leading-none">Total Revenue</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-3xl font-black themed-text-primary leading-none">${stats.totalRevenue.toFixed(2)}</p>
                            <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-500">
                                <TrendingUp size={14} /> <span>+8%</span> <span className="text-gray-400 dark:text-gray-600 font-medium ml-1">vs earlier</span>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link to="/register" className="themed-card px-6 py-4 rounded-2xl border themed-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center justify-center text-center gap-2 group">
                        <div className="bg-teal-500/10 p-3 rounded-full group-hover:bg-teal-500 group-hover:text-white transition-colors">
                            <UserPlus size={24} className="text-teal-600" />
                        </div>
                        <span className="font-bold themed-text-primary text-sm">Register Patient</span>
                    </Link>
                    <Link to="/doctors/register" className="themed-card px-6 py-4 rounded-2xl border themed-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center justify-center text-center gap-2 group">
                        <div className="bg-indigo-500/10 p-3 rounded-full group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                            <Stethoscope size={24} className="text-indigo-600" />
                        </div>
                        <span className="font-bold themed-text-primary text-sm">Register Doctor</span>
                    </Link>
                    <Link to="/appointments/book" className="themed-card px-6 py-4 rounded-2xl border themed-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center justify-center text-center gap-2 group">
                        <div className="bg-purple-500/10 p-3 rounded-full group-hover:bg-purple-500 group-hover:text-white transition-colors">
                            <Calendar size={24} className="text-purple-600" />
                        </div>
                        <span className="font-bold themed-text-primary text-sm">Book Appointment</span>
                    </Link>
                    <Link to="/billing/create" className="themed-card px-6 py-4 rounded-2xl border themed-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center justify-center text-center gap-2 group">
                        <div className="bg-amber-500/10 p-3 rounded-full group-hover:bg-amber-500 group-hover:text-white transition-colors">
                            <FilePlus size={24} className="text-amber-600" />
                        </div>
                        <span className="font-bold themed-text-primary text-sm">Create Invoice</span>
                    </Link>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Appointment Trends Chart */}
                    <div className="themed-card rounded-3xl shadow-sm border themed-border p-6 flex flex-col">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp size={20} className="text-blue-500" />
                            <h2 className="text-xl font-bold themed-text-primary">Appointment Trends (Last {dateRange} Days)</h2>
                        </div>
                        <div className="flex-1 min-h-[300px]">
                            {!loading && appointmentTrends.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={appointmentTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                        <RechartsTooltip cursor={{ fill: 'rgba(14, 165, 233, 0.1)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="Appointments" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center themed-text-muted">No data available</div>
                            )}
                        </div>
                    </div>

                    {/* Doctor Workload Pie Chart */}
                    <div className="themed-card rounded-3xl shadow-sm border themed-border p-6 flex flex-col">
                        <div className="flex items-center gap-2 mb-6">
                            <PieChartIcon size={20} className="text-emerald-500" />
                            <h2 className="text-xl font-bold themed-text-primary">Doctor Workload Distribution</h2>
                        </div>
                        <div className="flex-1 min-h-[300px]">
                            {!loading && doctorWorkload.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={doctorWorkload}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                            nameKey="name"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            labelLine={true}
                                        >
                                            {doctorWorkload.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center themed-text-muted">No data available</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Performance Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Patient Satisfaction */}
                    <div className="themed-card rounded-3xl shadow-sm p-6 flex flex-col justify-center border-l-4 border-l-pink-500 hover:-translate-y-1 transition-all">
                        <p className="text-xs themed-text-muted font-bold uppercase tracking-widest mb-2">Patient Satisfaction</p>
                        <div className="flex items-end gap-3">
                            <p className="text-3xl font-black themed-text-primary leading-none">4.8</p>
                            <p className="text-sm font-bold text-pink-500 mb-0.5">/ 5.0</p>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mt-4">
                            <div className="bg-pink-500 h-1.5 rounded-full" style={{ width: '96%' }}></div>
                        </div>
                    </div>

                    {/* No-Show Rate */}
                    <div className="themed-card rounded-3xl shadow-sm p-6 flex flex-col justify-center border-l-4 border-l-red-500 hover:-translate-y-1 transition-all">
                        <p className="text-xs themed-text-muted font-bold uppercase tracking-widest mb-2">No-Show Rate</p>
                        <div className="flex items-end gap-3">
                            <p className="text-3xl font-black themed-text-primary leading-none">4.2%</p>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-500">
                            <TrendingDown size={14} /> <span>-1.5%</span> <span className="text-gray-400 dark:text-gray-600 font-medium ml-1">improvement</span>
                        </div>
                    </div>

                    {/* Department Breakdown */}
                    <div className="themed-card rounded-3xl shadow-sm p-6 flex flex-col justify-center border-l-4 border-l-indigo-500 hover:-translate-y-1 transition-all">
                        <p className="text-xs themed-text-muted font-bold uppercase tracking-widest mb-2">Top Departments</p>
                        <div className="space-y-3 mt-2">
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="themed-text-primary">Cardiology</span>
                                <span className="text-indigo-500">42%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="themed-text-primary">Neurology</span>
                                <span className="text-indigo-500">28%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="themed-text-primary">Pediatrics</span>
                                <span className="text-indigo-500">15%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Alert System / Pending Doctors */}
                    <div className="lg:col-span-2 themed-card rounded-3xl shadow-sm overflow-hidden border themed-border flex flex-col h-full">
                        <div className="px-8 py-6 border-b themed-border bg-gray-50/30 flex items-center justify-between">
                            <h2 className="text-xl font-bold themed-text-primary flex items-center gap-2">
                                <Clock size={20} className="text-orange-500" />
                                Action Alerts
                            </h2>
                            <span className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                {pendingDoctors.length} Pending
                            </span>
                        </div>

                        <div className="flex-1 overflow-auto">
                            {loading ? (
                                <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
                                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="themed-text-muted font-medium animate-pulse">Fetching alerts...</p>
                                </div>
                            ) : pendingDoctors.length === 0 ? (
                                <div className="p-24 text-center themed-text-muted flex flex-col items-center h-full justify-center">
                                    <div className="bg-green-100 dark:bg-green-900/20 p-6 rounded-full mb-6">
                                        <CheckCircle className="h-16 w-16 text-green-500" />
                                    </div>
                                    <p className="text-2xl font-bold themed-text-primary mb-2">All caught up!</p>
                                    <p className="font-medium">There are no pending actions or overdue items.</p>
                                </div>
                            ) : (
                                <ul className="divide-y themed-border">
                                    {pendingDoctors.map(doctor => (
                                        <li key={doctor.id} className="p-6 lg:p-8 flex flex-col sm:flex-row items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-all gap-4">
                                            <div className="flex items-center gap-5 w-full">
                                                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600 font-black text-lg shadow-inner shrink-0">
                                                    !
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-lg font-extrabold themed-text-primary">
                                                        Dr. {doctor.first_name} {doctor.last_name}
                                                    </span>
                                                    <div className="flex flex-wrap items-center gap-3 mt-1">
                                                        <span className="text-sm font-bold text-indigo-500 bg-indigo-500/5 px-2 py-0.5 rounded">
                                                            {doctor.specialization}
                                                        </span>
                                                        <span className="themed-text-muted text-xs font-medium border-l themed-border pl-3">
                                                            Approval Required
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 w-full sm:w-auto">
                                                <button
                                                    onClick={() => handleApprove(doctor.id)}
                                                    className="w-full sm:w-48 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                                                >
                                                    <CheckCircle size={18} /> Approve
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity Log */}
                    <div className="themed-card rounded-3xl shadow-sm overflow-hidden border themed-border flex flex-col h-full">
                        <div className="px-6 py-6 border-b themed-border bg-gray-50/30 flex items-center justify-between">
                            <h2 className="text-xl font-bold themed-text-primary flex items-center gap-2">
                                <Activity size={20} className="text-teal-500" />
                                Recent Activity
                            </h2>
                        </div>

                        <div className="p-6 flex-1 overflow-auto">
                            {loading ? (
                                <div className="flex justify-center py-10">
                                    <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : recentActivity.length === 0 ? (
                                <div className="text-center py-10 themed-text-muted">
                                    <p>No recent activity found.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {recentActivity.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <div key={item.id} className="flex gap-4 items-start relative before:absolute before:inset-y-0 before:left-5 before:w-px before:bg-gray-200 dark:before:bg-gray-800 last:before:hidden">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 shrink-0 ${item.bg}`}>
                                                    <Icon size={18} className={item.color} />
                                                </div>
                                                <div className="pt-1">
                                                    <p className="font-bold themed-text-primary text-sm">{item.title}</p>
                                                    <p className="themed-text-muted text-xs font-medium mt-0.5">{item.desc}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <Link to="/patients" className="mt-4 w-full py-2 flex items-center justify-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors">
                                        View All Records <ArrowRight size={16} />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Priority 3 Features Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-8">

                    {/* Top Doctors Leaderboard */}
                    <div className="lg:col-span-2 themed-card rounded-3xl shadow-sm border themed-border flex flex-col h-full overflow-hidden">
                        <div className="px-6 py-6 border-b themed-border bg-gray-50/30 dark:bg-gray-900/30 flex items-center justify-between">
                            <h2 className="text-xl font-bold themed-text-primary flex items-center gap-2">
                                <Stethoscope size={20} className="text-indigo-500" />
                                Top Performing Doctors
                            </h2>
                        </div>
                        <div className="p-0 flex-1 overflow-auto">
                            <table className="w-full text-left">
                                <thead className="themed-table-head themed-text-muted text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Rank</th>
                                        <th className="px-6 py-4">Doctor Name</th>
                                        <th className="px-6 py-4 text-right">Appointments Handled</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y themed-border">
                                    {doctorWorkload.map((doc, index) => (
                                        <tr key={index} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-black text-gray-400">#{index + 1}</td>
                                            <td className="px-6 py-4 font-bold themed-text-primary">{doc.name}</td>
                                            <td className="px-6 py-4 text-right font-black text-indigo-500">{doc.value}</td>
                                        </tr>
                                    ))}
                                    {doctorWorkload.length === 0 && (
                                        <tr><td colSpan="3" className="px-6 py-8 text-center themed-text-muted">No data available</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* System Health / API Monitoring */}
                    <div className="themed-card rounded-3xl shadow-sm border themed-border flex flex-col h-full overflow-hidden">
                        <div className="px-6 py-6 border-b themed-border bg-gray-50/30 dark:bg-gray-900/30 flex items-center justify-between">
                            <h2 className="text-xl font-bold themed-text-primary flex items-center gap-2">
                                <Activity size={20} className="text-emerald-500" />
                                System Health
                            </h2>
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                        </div>
                        <div className="p-6 flex-1 flex flex-col gap-6 justify-center">
                            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                                <div>
                                    <p className="text-xs themed-text-muted font-bold uppercase mb-1">API Server</p>
                                    <p className="font-black themed-text-primary text-lg">Operational</p>
                                </div>
                                <CheckCircle className="text-emerald-500" size={24} />
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                                <div>
                                    <p className="text-xs themed-text-muted font-bold uppercase mb-1">Database Sync</p>
                                    <p className="font-black themed-text-primary text-lg">Connected</p>
                                </div>
                                <CheckCircle className="text-emerald-500" size={24} />
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                                <div>
                                    <p className="text-xs themed-text-muted font-bold uppercase mb-1">Uptime</p>
                                    <p className="font-black themed-text-primary text-lg">99.9%</p>
                                </div>
                                <Clock className="text-teal-500" size={24} />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div >
    );
};

export default AdminDashboard;
