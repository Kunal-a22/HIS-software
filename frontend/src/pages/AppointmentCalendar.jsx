import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar as CalendarIcon, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const AppointmentCalendar = () => {
    const { api } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await api.get('appointments/');
                const data = response.data.map(appt => {
                    const dateObj = new Date(appt.appointment_date);
                    const endDateObj = new Date(dateObj.getTime() + 60 * 60 * 1000);

                    return {
                        id: appt.id,
                        title: `${appt.patient_name} with ${appt.doctor_name}`,
                        start: dateObj,
                        end: endDateObj,
                        status: appt.status,
                        resource: appt
                    };
                });
                setEvents(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load appointments for calendar view.');
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [api]);

    const eventStyleGetter = (event, start, end, isSelected) => {
        let backgroundColor = '#3b82f6';
        if (event.status === 'Completed') backgroundColor = '#10b981';
        if (event.status === 'Cancelled') backgroundColor = '#ef4444';

        const style = {
            backgroundColor,
            borderRadius: '5px',
            opacity: 0.8,
            color: 'white',
            border: '0px',
            display: 'block'
        };
        return { style };
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold themed-text-primary flex items-center gap-3">
                        <CalendarIcon className="text-teal-500" /> Appointment Calendar
                    </h1>
                    <p className="themed-text-muted mt-1">Interactive visual schedule of all appointments</p>
                </div>
                <Link
                    to="/appointments/book"
                    className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all"
                >
                    + Book Appointment
                </Link>
            </div>

            <div className="themed-card rounded-3xl p-6 shadow-sm border themed-border min-h-[700px]">
                {error ? (
                    <div className="p-4 rounded-xl flex items-center gap-3 mb-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                        <AlertCircle size={20} /> {error}
                    </div>
                ) : loading ? (
                    <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-teal-500">
                        <Loader2 className="w-12 h-12 animate-spin mb-4" />
                        <p className="text-lg font-medium">Loading calendar...</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-inner h-[600px] text-gray-800 dark:text-gray-100 !css-isolation-override">
                        <BigCalendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            eventPropGetter={eventStyleGetter}
                            views={['month', 'week', 'day', 'agenda']}
                            tooltipAccessor={(event) => `${event.title} - Status: ${event.status}`}
                            popup
                        />
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .rbc-calendar { font-family: inherit; }
                .rbc-event { padding: 4px 8px; font-weight: 500; font-size: 0.85em; }
                .dark .rbc-month-view, .dark .rbc-time-view, .dark .rbc-agenda-view { border-color: rgba(255,255,255,0.1); }
                .dark .rbc-header { border-bottom-color: rgba(255,255,255,0.1); }
                .dark .rbc-month-row, .dark .rbc-day-bg { border-color: rgba(255,255,255,0.1); }
                .dark .rbc-off-range-bg { background-color: rgba(0,0,0,0.2); }
                .dark .rbc-today { background-color: rgba(20, 184, 166, 0.1); }
                .dark .rbc-btn-group button { color: #f3f4f6; border-color: rgba(255,255,255,0.2); }
                .dark .rbc-btn-group button:hover { background-color: rgba(255,255,255,0.1); }
                .dark .rbc-btn-group button.rbc-active { background-color: rgba(20, 184, 166, 0.8); color: white; border-color: transparent; }
                .dark button.rbc-show-more { color: #14b8a6; }
            `}} />
        </div>
    );
};

export default AppointmentCalendar;
