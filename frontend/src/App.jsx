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

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

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

    return () => socket.disconnect();
  }, [isAuthenticated, user]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { fontFamily: 'Inter, sans-serif' } }} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
