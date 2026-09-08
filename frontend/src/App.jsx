import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { io } from 'socket.io-client';
import { useAuthStore } from './store/authStore';
import { useAlertStore } from './store/alertStore';
import { useNotificationStore } from './store/notificationStore';
import { LanguageProvider } from './context/LanguageContext';

// Fallback loader component for lazy-loaded routes
function PageLoader() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>Loading page...</span>
    </div>
  );
}

import OfflineBanner from './components/common/OfflineBanner';

// Lazy loaded Common Pages
const MissingPersonsPage = lazy(() => import('./pages/common/MissingPersonsPage'));

// Lazy loaded Auth Pages
const LandingPage = lazy(() => import('./pages/auth/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));

// Lazy loaded Affected Person Pages
const AffectedDashboard = lazy(() => import('./pages/affected/Dashboard'));
const SOSPage = lazy(() => import('./pages/affected/SOSPage'));
const ReliefRequestPage = lazy(() => import('./pages/affected/ReliefRequestPage'));
const CampFinderPage = lazy(() => import('./pages/affected/CampFinderPage'));
const MyRequestsPage = lazy(() => import('./pages/affected/MyRequestsPage'));
const AlertsPage = lazy(() => import('./pages/affected/AlertsPage'));
const GlobalSafetyPage = lazy(() => import('./pages/affected/GlobalSafetyPage'));
const PublicDonatePage = lazy(() => import('./pages/PublicDonatePage'));

// Lazy loaded Volunteer Pages
const VolunteerDashboard = lazy(() => import('./pages/volunteer/Dashboard'));
const NearbyRequestsPage = lazy(() => import('./pages/volunteer/NearbyRequestsPage'));
const TaskDetailPage = lazy(() => import('./pages/volunteer/TaskDetailPage'));
const TaskHistoryPage = lazy(() => import('./pages/volunteer/TaskHistoryPage'));
const SkillsPage = lazy(() => import('./pages/volunteer/SkillsPage'));

// Lazy loaded NGO Pages
const NGODashboard = lazy(() => import('./pages/ngo/Dashboard'));
const CampManagementPage = lazy(() => import('./pages/ngo/CampManagementPage'));
const InventoryPage = lazy(() => import('./pages/ngo/InventoryPage'));
const ReliefApprovalsPage = lazy(() => import('./pages/ngo/ReliefApprovalsPage'));
const DonationsPage = lazy(() => import('./pages/ngo/DonationsPage'));
const NGOReportsPage = lazy(() => import('./pages/ngo/ReportsPage'));

// Operational Coordination Pages (Managed by NGO / Relief Center)
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage'));
const AlertBroadcastPage = lazy(() => import('./pages/admin/AlertBroadcastPage'));
const SOSManagementPage = lazy(() => import('./pages/admin/SOSManagementPage'));

// Use an empty string so Socket.IO automatically uses the current browser origin (localtunnel) and proxies it through Vite.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

// Protected Route Guard
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
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
      if (user?.role === 'volunteer' || user?.role === 'ngo') {
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
    <LanguageProvider>
      <BrowserRouter>
        <OfflineBanner />
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { fontFamily: 'Inter, sans-serif' } }} />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/home" element={<RoleRedirect />} />

            {/* Missing Persons Directory Route */}
            <Route path="/missing-persons" element={
              <ProtectedRoute allowedRoles={['affected', 'volunteer', 'ngo', 'admin']}>
                <MissingPersonsPage />
              </ProtectedRoute>
            } />

            {/* Affected Person Routes */}
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
            <Route path="/donate" element={<PublicDonatePage />} />

            {/* Volunteer Routes */}
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

            {/* NGO / Relief Center Routes (The Central Operational & Coordination Hub) */}
            <Route path="/ngo" element={
              <ProtectedRoute allowedRoles={['ngo']}>
                <NGODashboard />
              </ProtectedRoute>
            } />
            <Route path="/ngo/sos" element={
              <ProtectedRoute allowedRoles={['ngo']}>
                <SOSManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/ngo/alerts" element={
              <ProtectedRoute allowedRoles={['ngo']}>
                <AlertBroadcastPage />
              </ProtectedRoute>
            } />
            <Route path="/ngo/camps" element={
              <ProtectedRoute allowedRoles={['ngo']}>
                <CampManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/ngo/inventory" element={
              <ProtectedRoute allowedRoles={['ngo']}>
                <InventoryPage />
              </ProtectedRoute>
            } />
            <Route path="/ngo/approvals" element={
              <ProtectedRoute allowedRoles={['ngo']}>
                <ReliefApprovalsPage />
              </ProtectedRoute>
            } />
            <Route path="/ngo/volunteers" element={
              <ProtectedRoute allowedRoles={['ngo']}>
                <UserManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/ngo/donations" element={
              <ProtectedRoute allowedRoles={['ngo']}>
                <DonationsPage />
              </ProtectedRoute>
            } />
            <Route path="/ngo/reports" element={
              <ProtectedRoute allowedRoles={['ngo']}>
                <NGOReportsPage />
              </ProtectedRoute>
            } />

            {/* Graceful legacy redirect: Any /admin route redirects to /ngo */}
            <Route path="/admin/*" element={<Navigate to="/ngo" replace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
