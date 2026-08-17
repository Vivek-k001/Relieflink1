import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { io } from 'socket.io-client';
import { useAuthStore } from './store/authStore';
import { useAlertStore } from './store/alertStore';
import { useNotificationStore } from './store/notificationStore';

// Auth Pages
import LandingPage from './pages/auth/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Affected Person Pages
import AffectedDashboard from './pages/affected/Dashboard';
import SOSPage from './pages/affected/SOSPage';
import ReliefRequestPage from './pages/affected/ReliefRequestPage';
import CampFinderPage from './pages/affected/CampFinderPage';
import MyRequestsPage from './pages/affected/MyRequestsPage';
import AlertsPage from './pages/affected/AlertsPage';
import GlobalSafetyPage from './pages/affected/GlobalSafetyPage';

// Volunteer Pages
import VolunteerDashboard from './pages/volunteer/Dashboard';
import NearbyRequestsPage from './pages/volunteer/NearbyRequestsPage';
import TaskDetailPage from './pages/volunteer/TaskDetailPage';
import TaskHistoryPage from './pages/volunteer/TaskHistoryPage';
import SkillsPage from './pages/volunteer/SkillsPage';

// NGO Pages
import NGODashboard from './pages/ngo/Dashboard';
import CampManagementPage from './pages/ngo/CampManagementPage';
import InventoryPage from './pages/ngo/InventoryPage';
import ReliefApprovalsPage from './pages/ngo/ReliefApprovalsPage';
import DonationsPage from './pages/ngo/DonationsPage';
import NGOReportsPage from './pages/ngo/ReportsPage';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import AlertBroadcastPage from './pages/admin/AlertBroadcastPage';
import SOSManagementPage from './pages/admin/SOSManagementPage';
import SystemReportsPage from './pages/admin/SystemReportsPage';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Protected Route
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={getRoleHome(user?.role)} replace />;
  }
  return children;
}

function getRoleHome(role) {
  const map = {
    affected: '/dashboard',
    volunteer: '/volunteer',
    ngo: '/ngo',
    admin: '/admin',
  };
  return map[role] || '/login';
}

// Role-based home redirect
function RoleRedirect() {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={getRoleHome(user?.role)} replace />;
}

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const { addAlert } = useAlertStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      console.log('🔌 Socket connected');
      if (user?._id) socket.emit('join_room', user._id);
    });

    socket.on('new_alert', (alertData) => {
      addAlert(alertData);
      addNotification({ title: alertData.title, message: alertData.message, type: 'alert' });
    });

    socket.on('new_sos', (data) => {
      if (user?.role === 'volunteer' || user?.role === 'admin') {
        addNotification({ title: '🆘 New SOS Request', message: data.message, type: 'sos' });
      }
    });

    socket.on('sos_accepted', () => {
      addNotification({ title: '✅ Help is on the way!', message: 'A volunteer accepted your SOS.', type: 'sos' });
    });

    socket.on('relief_approved', () => {
      addNotification({ title: '✅ Relief Request Approved', message: 'Your relief request was approved.', type: 'relief' });
    });

    return () => socket.disconnect();
  }, [isAuthenticated, user]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { fontFamily: 'Inter, sans-serif' } }} />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<RoleRedirect />} />

        {/* Affected Person */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['affected']}>
            <AffectedDashboard />
          </ProtectedRoute>
        } />
        <Route path="/sos" element={
          <ProtectedRoute allowedRoles={['affected', 'admin']}>
            <SOSPage />
          </ProtectedRoute>
        } />
        <Route path="/relief-request" element={
          <ProtectedRoute allowedRoles={['affected', 'admin']}>
            <ReliefRequestPage />
          </ProtectedRoute>
        } />
        <Route path="/camp-finder" element={
          <ProtectedRoute allowedRoles={['affected', 'volunteer', 'admin']}>
            <CampFinderPage />
          </ProtectedRoute>
        } />
        <Route path="/my-requests" element={
          <ProtectedRoute allowedRoles={['affected']}>
            <MyRequestsPage />
          </ProtectedRoute>
        } />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/safety" element={<GlobalSafetyPage />} />

        {/* Volunteer */}
        <Route path="/volunteer" element={
          <ProtectedRoute allowedRoles={['volunteer']}>
            <VolunteerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/volunteer/nearby" element={
          <ProtectedRoute allowedRoles={['volunteer']}>
            <NearbyRequestsPage />
          </ProtectedRoute>
        } />
        <Route path="/volunteer/tasks/:id" element={
          <ProtectedRoute allowedRoles={['volunteer']}>
            <TaskDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/volunteer/history" element={
          <ProtectedRoute allowedRoles={['volunteer']}>
            <TaskHistoryPage />
          </ProtectedRoute>
        } />
        <Route path="/volunteer/skills" element={
          <ProtectedRoute allowedRoles={['volunteer']}>
            <SkillsPage />
          </ProtectedRoute>
        } />

        {/* NGO */}
        <Route path="/ngo" element={
          <ProtectedRoute allowedRoles={['ngo']}>
            <NGODashboard />
          </ProtectedRoute>
        } />
        <Route path="/ngo/camps" element={
          <ProtectedRoute allowedRoles={['ngo', 'admin']}>
            <CampManagementPage />
          </ProtectedRoute>
        } />
        <Route path="/ngo/inventory" element={
          <ProtectedRoute allowedRoles={['ngo', 'admin']}>
            <InventoryPage />
          </ProtectedRoute>
        } />
        <Route path="/ngo/approvals" element={
          <ProtectedRoute allowedRoles={['ngo', 'admin']}>
            <ReliefApprovalsPage />
          </ProtectedRoute>
        } />
        <Route path="/ngo/donations" element={
          <ProtectedRoute allowedRoles={['ngo', 'admin']}>
            <DonationsPage />
          </ProtectedRoute>
        } />
        <Route path="/ngo/reports" element={
          <ProtectedRoute allowedRoles={['ngo', 'admin']}>
            <NGOReportsPage />
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagementPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/alerts" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AlertBroadcastPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/sos" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <SOSManagementPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <SystemReportsPage />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
