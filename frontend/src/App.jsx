import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PatientRegistration from './components/PatientRegistration';
import PatientDirectory from './components/PatientDirectory';
import PatientDetail from './components/PatientDetail';
import DoctorDirectory from './components/DoctorDirectory';
import DoctorDetail from './components/DoctorDetail';
import DoctorRegistration from './components/DoctorRegistration';
import AppointmentList from './components/AppointmentList';
import BookAppointment from './components/BookAppointment';
import BillingList from './components/BillingList';
import CreatePrescription from './components/CreatePrescription';
import InvoiceDetail from './components/InvoiceDetail';
import CreateInvoice from './components/CreateInvoice';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import DashboardRouter from './pages/DashboardRouter';
import UploadMedicalReport from './components/UploadMedicalReport';
import FinancialDashboard from './pages/FinancialDashboard';
import AppointmentCalendar from './pages/AppointmentCalendar';
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<DashboardRouter />} />
                <Route path="patients" element={<PatientDirectory />} />
                <Route path="patients/:id" element={<PatientDetail />} />
                <Route path="patients/:patientId/upload-report" element={<UploadMedicalReport />} />
                <Route path="register" element={<PatientRegistration />} />
                <Route path="doctors" element={<DoctorDirectory />} />
                <Route path="doctors/:id" element={<DoctorDetail />} />
                <Route path="doctors/register" element={<DoctorRegistration />} />
                <Route path="appointments" element={<AppointmentList />} />
                <Route path="appointments/book" element={<BookAppointment />} />
                <Route path="calendar" element={<AppointmentCalendar />} />
                <Route path="billing" element={<BillingList />} />
                <Route path="billing/create" element={<CreateInvoice />} />
                <Route path="billing/:id" element={<InvoiceDetail />} />
                <Route path="finance" element={<FinancialDashboard />} />
                <Route path="patients/:patientId/prescribe" element={<CreatePrescription />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
