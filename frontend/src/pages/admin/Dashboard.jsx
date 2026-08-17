import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { adminAPI, sosAPI } from '../../api';
import { Users, AlertTriangle, Package, MapPin, CheckCircle, ShieldAlert, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentSOS, setRecentSOS] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats().then(r => { setStats(r.data.stats); setRecentSOS(r.data.recentSOS || []); }).finally(() => setLoading(false));
  }, []);

  const STAT_CARDS = stats ? [
    { icon: '👥', label: 'Total Users', val: stats.users, color: '#2563EB', bg: '#EFF6FF', to: '/admin/users' },
    { icon: '🆘', label: 'Pending SOS', val: stats.sosPending, color: '#DC2626', bg: '#FEF2F2', to: '/admin/sos' },
    { icon: '📦', label: 'Pending Relief', val: stats.reliefPending, color: '#D97706', bg: '#FFFBEB', to: '/ngo/approvals' },
    { icon: '🏕️', label: 'Active Camps', val: stats.camps, color: '#059669', bg: '#ECFDF5', to: '/ngo/camps' },
    { icon: '⚠️', label: 'Active Alerts', val: stats.activeAlerts, color: '#7C3AED', bg: '#EDE9FE', to: '/admin/alerts' },
    { icon: '✅', label: 'Tasks Completed', val: stats.tasksCompleted, color: '#0284C7', bg: '#F0F9FF' },
    { icon: '🆘 Total', label: 'All SOS', val: stats.sosTotal, color: '#64748B', bg: '#F8FAFC' },
    { icon: '💝', label: 'Donations', val: stats.donations, color: '#E11D48', bg: '#FFF1F2' },
  ] : [];

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        <div style={{ background: 'linear-gradient(135deg, #111827, #1F2937)', padding: '1.75rem 2rem', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Activity size={24} style={{ color: '#60A5FA' }} />
            <h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem' }}>Admin Control Center</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>System-wide oversight and management</p>
        </div>

        <div className="dashboard-main">
          {loading ? (
            <div className="grid-4">{[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12 }} />)}</div>
          ) : (
            <>
              <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
                {STAT_CARDS.map(s => (
                  <div key={s.label} className={`stat-card${s.to ? ' card-clickable' : ''}`} style={{ borderTop: `3px solid ${s.color}`, cursor: s.to ? 'pointer' : 'default' }} onClick={() => s.to && navigate(s.to)}>
                    <div className="stat-icon" style={{ background: s.bg }}><span style={{ fontSize: '1.375rem' }}>{s.icon}</span></div>
                    <div className="stat-value" style={{ color: s.color }}>{s.val}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Role Breakdown */}
              <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                <div className="card">
                  <div className="card-header"><h4>👥 Users by Role</h4></div>
                  <div className="card-body">
                    {stats?.usersByRole?.map(r => (
                      <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1rem' }}>{r._id === 'admin' ? '⚙️' : r._id === 'ngo' ? '🏥' : r._id === 'volunteer' ? '🦺' : '🆘'}</span>
                          <span style={{ fontWeight: 600, color: '#1E293B', textTransform: 'capitalize', fontSize: '0.875rem' }}>{r._id}</span>
                        </div>
                        <span style={{ fontWeight: 800, color: '#2563EB', fontSize: '1.125rem' }}>{r.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent SOS */}
                <div className="card">
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h4>🆘 Recent SOS</h4>
                    <button onClick={() => navigate('/admin/sos')} style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem' }}>View all →</button>
                  </div>
                  <div className="card-body">
                    {recentSOS.length === 0 ? <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>No pending SOS</p> : recentSOS.map(s => (
                      <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid #F1F5F9' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1E293B' }}>{s.disasterType} — {s.userId?.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{new Date(s.createdAt).toLocaleTimeString()}</div>
                        </div>
                        <span className={`badge badge-${s.priority === 'critical' ? 'red' : 'yellow'}`}>{s.priority}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Admin Actions */}
              <div className="card">
                <div className="card-header"><h4>⚡ Quick Actions</h4></div>
                <div className="card-body" style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
                  {[
                    { to: '/admin/users', icon: <Users size={18} />, label: 'Manage Users', color: '#2563EB', bg: '#EFF6FF' },
                    { to: '/admin/alerts', icon: <ShieldAlert size={18} />, label: 'Broadcast Alert', color: '#DC2626', bg: '#FEF2F2' },
                    { to: '/admin/sos', icon: <AlertTriangle size={18} />, label: 'SOS Management', color: '#D97706', bg: '#FFFBEB' },
                    { to: '/admin/reports', icon: <Activity size={18} />, label: 'System Reports', color: '#059669', bg: '#ECFDF5' },
                  ].map(a => (
                    <button key={a.to} onClick={() => navigate(a.to)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: 10, background: a.bg, color: a.color, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${a.bg}`; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                      {a.icon} {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
