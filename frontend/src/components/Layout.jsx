import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, UserPlus, Users, Activity, Sun, Moon, Stethoscope, Calendar, LogOut, CreditCard, DollarSign, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const { isDark, toggleTheme } = useTheme();
    const { user, logout } = useAuth();

    return (
        <div className="flex h-screen themed-layout font-sans">
            {/* Sidebar */}
            <aside className="w-64 themed-sidebar text-white flex flex-col shadow-xl">
                {/* Logo */}
                <div className="p-6 flex items-center space-x-3 border-b border-white/10">
                    <div className="bg-white/20 p-2 rounded-lg">
                        <Activity className="h-6 w-6 text-teal-300" />
                    </div>
                    <span className="text-xl font-bold tracking-wide">PulseHIS</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-8 px-4 space-y-2">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                ? 'bg-teal-500 text-white shadow-md'
                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                            }`
                        }
                    >
                        <Home className="h-5 w-5" />
                        <span>Dashboard</span>
                    </NavLink>

                    {user?.role !== 'PendingDoctor' && (
                        <NavLink
                            to="/patients"
                            end
                            className={({ isActive }) =>
                                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                    ? 'bg-teal-500 text-white shadow-md'
                                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }`
                            }
                        >
                            <Users className="h-5 w-5" />
                            <span>Patient Directory</span>
                        </NavLink>
                    )}

                    {user?.role !== 'Doctor' && user?.role !== 'PendingDoctor' && (
                        <NavLink
                            to="/register"
                            className={({ isActive }) =>
                                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                    ? 'bg-teal-500 text-white shadow-md'
                                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }`
                            }
                        >
                            <UserPlus className="h-5 w-5" />
                            <span>Register Patient</span>
                        </NavLink>
                    )}

                    {user?.role !== 'Doctor' && user?.role !== 'PendingDoctor' && (
                        <>
                            <div className="pt-4 pb-1 px-4">
                                <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Doctors</p>
                            </div>

                            <NavLink
                                to="/doctors"
                                end
                                className={({ isActive }) =>
                                    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                        ? 'bg-teal-500 text-white shadow-md'
                                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                                    }`
                                }
                            >
                                <Stethoscope className="h-5 w-5" />
                                <span>Doctor Directory</span>
                            </NavLink>

                            <NavLink
                                to="/doctors/register"
                                className={({ isActive }) =>
                                    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                        ? 'bg-teal-500 text-white shadow-md'
                                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                                    }`
                                }
                            >
                                <UserPlus className="h-5 w-5" />
                                <span>Register Doctor</span>
                            </NavLink>
                        </>
                    )}

                    {user?.role !== 'PendingDoctor' && (
                        <>
                            {/* Appointments section */}
                            <div className="pt-4 pb-1 px-4">
                                <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Appointments</p>
                            </div>

                            <NavLink
                                to="/appointments"
                                end
                                className={({ isActive }) =>
                                    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                        ? 'bg-teal-500 text-white shadow-md'
                                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                                    }`
                                }
                            >
                                <Calendar className="h-5 w-5" />
                                <span>Appointment List</span>
                            </NavLink>

                            <NavLink
                                to="/appointments/book"
                                className={({ isActive }) =>
                                    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                        ? 'bg-teal-500 text-white shadow-md'
                                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                                    }`
                                }
                            >
                                <Calendar className="h-5 w-5" />
                                <span>Book Appointment</span>
                            </NavLink>

                            <NavLink
                                to="/calendar"
                                className={({ isActive }) =>
                                    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                        ? 'bg-teal-500 text-white shadow-md'
                                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                                    }`
                                }
                            >
                                <Calendar className="h-5 w-5" />
                                <span>Calendar View</span>
                            </NavLink>
                        </>
                    )}

                    {user?.role !== 'Doctor' && user?.role !== 'PendingDoctor' && (
                        <>
                            <div className="pt-4 pb-1 px-4">
                                <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Finance</p>
                            </div>

                            <NavLink
                                to="/finance"
                                className={({ isActive }) =>
                                    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                        ? 'bg-teal-500 text-white shadow-md'
                                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                                    }`
                                }
                            >
                                <DollarSign className="h-5 w-5" />
                                <span>Financial Dashboard</span>
                            </NavLink>

                            <NavLink
                                to="/billing"
                                end
                                className={({ isActive }) =>
                                    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                        ? 'bg-teal-500 text-white shadow-md'
                                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                                    }`
                                }
                            >
                                <CreditCard className="h-5 w-5" />
                                <span>Billing & Invoices</span>
                            </NavLink>
                        </>
                    )}
                </nav>

                <div className="p-4 border-t border-white/10 text-sm text-white/40 text-center">
                    &copy; {new Date().getFullYear()} PulseHIS System
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="themed-header h-16 flex items-center justify-between px-6 relative z-10 shadow-sm border-b themed-border">
                    {/* Global Search Bar */}
                    <div className="hidden md:block flex-1 max-w-lg">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl leading-5 bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all sm:text-sm"
                                placeholder="Search patients, doctors, or appointments... (Press '/')"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            className="themed-toggle-btn flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all hover:scale-105"
                        >
                            {isDark ? (
                                <><Sun className="h-4 w-4 text-yellow-400" /><span className="themed-text-primary">Light Mode</span></>
                            ) : (
                                <><Moon className="h-4 w-4 text-indigo-600" /><span className="themed-text-primary">Dark Mode</span></>
                            )}
                        </button>

                        {/* User Profile & Logout */}
                        <div className="flex items-center space-x-4 border-l themed-border pl-6">
                            <div className="flex items-center space-x-2">
                                <div className="w-9 h-9 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-inner shadow-teal-700/50">
                                    {user?.username?.[0] || 'A'}
                                </div>
                                <div className="flex flex-col">
                                    <span className="themed-text-primary font-bold text-sm leading-tight">{user?.username || 'Admin User'}</span>
                                    <span className="themed-text-muted text-[10px] uppercase tracking-wider font-semibold">{user?.role || 'Staff Member'}</span>
                                </div>
                            </div>

                            <button
                                onClick={logout}
                                title="Logout"
                                className="p-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-all hover:scale-110 active:scale-95"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto p-6 themed-content">
                    <Outlet />
                </div>
            </main>
        </div >
    );
};

export default Layout;
