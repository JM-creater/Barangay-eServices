import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { HomePage } from './pages/home/HomePage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { PublicDocumentVerification } from './pages/verify/PublicDocumentVerification';
import { ServicesCatalog } from './pages/services/ServicesCatalog';
import { ApplyService } from './pages/services/ApplyService';
import { RequestTracking } from './pages/requests/RequestTracking';
import { ResidentRequests } from './pages/requests/ResidentRequests';
import { RequestDetail } from './pages/requests/RequestDetail';
import { ResidentDashboard } from './pages/dashboard/ResidentDashboard';
import { ResidentAppointments } from './pages/appointments/ResidentAppointments';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { StaffRequestList } from './pages/staff/StaffRequestList';
import { StaffRequestReview } from './pages/staff/StaffRequestReview';
import { StaffAppointments } from './pages/staff/StaffAppointments';
import { StaffReleaseList } from './pages/staff/StaffReleaseList';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminServices } from './pages/admin/AdminServices';
import { AdminSlots } from './pages/admin/AdminSlots';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';
import { NotFound } from './pages/404/NotFound';
import { AdminRoute, ProtectedRoute, StaffRoute } from './routes';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify" element={<PublicDocumentVerification />} />
          <Route path="/verify/:controlNumber" element={<PublicDocumentVerification />} />
          <Route path="/services" element={<ServicesCatalog />} />
          <Route path="/services/:id/apply" element={<ApplyService />} />
          <Route path="/track" element={<RequestTracking />} />
          <Route path="/track/:referenceNumber" element={<RequestTracking />} />

          {/* Resident Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ResidentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-requests"
            element={
              <ProtectedRoute>
                <ResidentRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests/:id"
            element={
              <ProtectedRoute>
                <RequestDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-appointments"
            element={
              <ProtectedRoute>
                <ResidentAppointments />
              </ProtectedRoute>
            }
          />

          {/* Staff & Approver Routes */}
          <Route
            path="/staff/dashboard"
            element={
              <StaffRoute>
                <StaffDashboard />
              </StaffRoute>
            }
          />
          <Route
            path="/staff/requests"
            element={
              <StaffRoute>
                <StaffRequestList />
              </StaffRoute>
            }
          />
          <Route
            path="/staff/requests/:id"
            element={
              <StaffRoute>
                <StaffRequestReview />
              </StaffRoute>
            }
          />
          <Route
            path="/staff/appointments"
            element={
              <StaffRoute>
                <StaffAppointments />
              </StaffRoute>
            }
          />
          <Route
            path="/staff/releases"
            element={
              <StaffRoute>
                <StaffReleaseList />
              </StaffRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <AdminRoute>
                <AdminServices />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/slots"
            element={
              <AdminRoute>
                <AdminSlots />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <AdminRoute>
                <AdminAuditLogs />
              </AdminRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};