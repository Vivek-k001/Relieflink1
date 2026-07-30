import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { useAuthStore } from '../../store/authStore';
import { authAPI, sosAPI, reliefAPI, weatherAPI, alertAPI } from '../../api';
import toast from 'react-hot-toast';
import { AlertTriangle, Package, MapPin, ClipboardList, CheckCircle, Radio, Thermometer, Droplets } from 'lucide-react';

export default function AffectedDashboard() {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [myRequests, setMyRequests] = useState({ sos: [], relief: [] });
  const [safeLoading, setSafeLoading] = useState(false);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(async pos => {
      try { const r = await weatherAPI.get(pos.coords.latitude, pos.coords.longitude); setWeather(r.data.weather); } catch {}
    });
    alertAPI.getAll({ active: true }).then(r => setAlerts(r.data.alerts?.slice(0, 3) || [])).catch(() => {});
    sosAPI.getAll().then(r => setMyRequests(prev => ({ ...prev, sos: r.data.sosList || [] }))).catch(() => {});
    reliefAPI.getAll().then(r => setMyRequests(prev => ({ ...prev, relief: r.data.list || [] }))).catch(() => {});
  }, []);

  const handleSafeToggle = async () => {
    setSafeLoading(true);
    try {
      const res = await authAPI.updateSafeStatus(!user.isSafe);
      updateUser({ isSafe: res.data.isSafe });
      toast.success(res.data.message);
    } catch { toast.error('Failed to update status'); }
    setSafeLoading(false);
  };

  const QUICK_ACTIONS = [
    { icon: '🆘', label: 'Send SOS', desc: 'Request immediate rescue', to: '/sos', bg: '#FEF2F2', border: '#FCA5A5', color: '#DC2626', pulse: true },
    { icon: '📦', label: 'Request Relief', desc: 'Food, water, medicine', to: '/relief-request', bg: '#EFF6FF', border: '#93C5FD', color: '#2563EB' },
    { icon: '🏕️', label: 'Find Camps', desc: 'Nearby safe shelters', to: '/camp-finder', bg: '#F0FDF4', border: '#86EFAC', color: '#16A34A' },
    { icon: '📋', label: 'My Requests', desc: 'Track all your requests', to: '/my-requests', bg: '#FFF7ED', border: '#FCD34D', color: '#D97706' },
    { icon: '📡', label: 'Live Alerts', desc: 'Disaster notifications', to: '/alerts', bg: '#F0F9FF', border: '#7DD3FC', color: '#0284C7' },
  ];

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', padding: '1.75rem 2rem', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ color: 'white', fontSize: '1.5rem', fontFamily: 'Outfit,sans-serif', marginBottom: '0.25rem' }}>
                Hello, {user?.name?.split(' ')[0]} 👋
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Stay safe and connected during this emergency</p>
            </div>

            {/* I'm Safe Button */}
            <button onClick={handleSafeToggle} disabled={safeLoading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: 12, background: user?.isSafe ? '#10B981' : 'rgba(255,255,255,0.2)', color: 'white', border: user?.isSafe ? 'none' : '2px solid rgba(255,255,255,0.5)', fontWeight: 700, cursor: 'pointer', fontSize: '0.9375rem', transition: 'all 0.2s', backdropFilter: 'blur(10px)' }}>
              <CheckCircle size={18} />
              {safeLoading ? 'Updating...' : user?.isSafe ? "✅ I'm Safe" : "Mark I'm Safe"}
            </button>
          </div>

          {/* Weather Strip */}
          {weather && (
            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)' }}>📍 {weather.city} — <Thermometer size={12} style={{ display: 'inline' }} /> {weather.temperature}°C, {weather.description}</span>
              <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}><Droplets size={12} style={{ display: 'inline' }} /> {weather.humidity}% humidity</span>
            </div>
          )}
        </div>

        <div className="dashboard-main">
          {/* Active Alerts */}
          {alerts.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              {alerts.map(a => (
                <div key={a._id} style={{ background: a.severity === 'emergency' ? '#FEF2F2' : '#FFFBEB', border: `1px solid ${a.severity === 'emergency' ? '#FCA5A5' : '#FCD34D'}`, borderRadius: 12, padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.625rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{a.severity === 'emergency' ? '🚨' : '⚠️'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.9rem' }}>{a.title}</div>
                    <div style={{ color: '#64748B', fontSize: '0.8125rem', marginTop: 2 }}>{a.message}</div>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: 10, fontWeight: 600, whiteSpace: 'nowrap' }}>ACTIVE</span>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <h3 style={{ marginBottom: '1rem', color: '#1E293B', fontSize: '1.125rem' }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {QUICK_ACTIONS.map(a => (
              <button key={a.to} onClick={() => navigate(a.to)} style={{ border: `2px solid ${a.border}`, background: a.bg, borderRadius: 14, padding: '1.25rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${a.border}60`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                {a.pulse && <span style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, background: '#EF4444', borderRadius: '50%', animation: 'pulse-sos 1.5s infinite' }} />}
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{a.icon}</div>
                <div style={{ fontWeight: 700, color: a.color, fontSize: '0.9375rem' }}>{a.label}</div>
                <div style={{ color: '#64748B', fontSize: '0.8125rem', marginTop: '0.125rem' }}>{a.desc}</div>
              </button>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid-2">
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>🆘 My SOS Requests</h4>
                <button onClick={() => navigate('/my-requests')} style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 600 }}>View all</button>
              </div>
              <div className="card-body">
                {myRequests.sos.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem' }}>
                    <AlertTriangle size={32} color="#E2E8F0" />
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>No SOS requests</p>
                  </div>
                ) : myRequests.sos.slice(0, 3).map(s => (
                  <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid #F1F5F9' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1E293B' }}>{s.disasterType}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{new Date(s.createdAt).toLocaleString()}</div>
                    </div>
                    <span className={`badge badge-${s.status === 'resolved' ? 'green' : s.status === 'pending' ? 'yellow' : 'blue'}`}>{s.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>📦 My Relief Requests</h4>
                <button onClick={() => navigate('/my-requests')} style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 600 }}>View all</button>
              </div>
              <div className="card-body">
                {myRequests.relief.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem' }}>
                    <Package size={32} color="#E2E8F0" />
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>No relief requests</p>
                  </div>
                ) : myRequests.relief.slice(0, 3).map(r => (
                  <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid #F1F5F9' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1E293B' }}>{r.items?.length} items requested</div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{new Date(r.createdAt).toLocaleString()}</div>
                    </div>
                    <span className={`badge badge-${r.status === 'delivered' ? 'green' : r.status === 'pending' ? 'yellow' : 'blue'}`}>{r.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
