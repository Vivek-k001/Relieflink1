import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import MapView from '../../components/maps/MapView';
import { taskAPI, sosAPI } from '../../api';
import { useAuthStore } from '../../store/authStore';
import { useLocationStore } from '../../store/locationStore';
import { CheckCircle, Clock, MapPin, BarChart3 } from 'lucide-react';

export default function VolunteerDashboard() {
  const { user } = useAuthStore();
  const { lat, lng, getLocation } = useLocationStore();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [nearbySos, setNearbySos] = useState([]);
  const [stats, setStats] = useState({ active: 0, completed: 0, pending: 0 });

  useEffect(() => { getLocation(); }, []);

  useEffect(() => {
    taskAPI.getMyTasks().then(r => {
      const list = r.data.tasks || [];
      setTasks(list);
      setStats({ active: list.filter(t => ['assigned','accepted','in_progress'].includes(t.status)).length, completed: list.filter(t => t.status === 'completed').length, pending: list.filter(t => t.status === 'assigned').length });
    }).catch(() => {});
    if (lat && lng) {
      sosAPI.getAll({ lat, lng, radius: 20, status: 'pending' }).then(r => setNearbySos(r.data.sosList || [])).catch(() => {});
    }
  }, [lat, lng]);

  const activeTasks = tasks.filter(t => ['assigned', 'accepted', 'in_progress'].includes(t.status));

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', padding: '1.75rem 2rem', color: 'white' }}>
          <h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem' }}>🦺 Volunteer Dashboard</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>Welcome back, {user?.name?.split(' ')[0]}. Ready to help?</p>
        </div>

        <div className="dashboard-main">
          {/* Stats */}
          <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
            {[
              { icon: '🆘', val: nearbySos.length, label: 'Nearby SOS', color: '#DC2626', bg: '#FEF2F2' },
              { icon: '📋', val: stats.pending, label: 'Assigned Tasks', color: '#D97706', bg: '#FFFBEB' },
              { icon: '⚡', val: stats.active, label: 'Active Tasks', color: '#2563EB', bg: '#EFF6FF' },
              { icon: '✅', val: user?.tasksCompleted || stats.completed, label: 'Tasks Done', color: '#16A34A', bg: '#F0FDF4' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                <div className="stat-icon" style={{ background: s.bg }}><span style={{ fontSize: '1.375rem' }}>{s.icon}</span></div>
                <div className="stat-value" style={{ color: s.color }}>{s.val}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid-2">
            {/* Active Tasks */}
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>⚡ Active Tasks</h4>
                <button onClick={() => navigate('/volunteer/nearby')} style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 600 }}>Find more →</button>
              </div>
              <div className="card-body">
                {activeTasks.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem' }}>
                    <Clock size={36} color="#BFDBFE" />
                    <h3>No active tasks</h3>
                    <p>Accept nearby SOS or relief requests</p>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/volunteer/nearby')} style={{ marginTop: '0.75rem' }}>Find Nearby</button>
                  </div>
                ) : activeTasks.map(t => (
                  <div key={t._id} onClick={() => navigate(`/volunteer/tasks/${t._id}`)} style={{ padding: '0.875rem 0', borderBottom: '1px solid #F1F5F9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1E293B' }}>{t.type === 'rescue' ? '🆘' : '📦'} {t.description?.slice(0, 40)}...</div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 2 }}>{t.destinationAddress || 'Location available'}</div>
                    </div>
                    <span className={`badge badge-${t.status === 'in_progress' ? 'blue' : 'yellow'}`}>{t.status?.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby SOS Map */}
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>🗺️ Nearby SOS ({nearbySos.length})</h4>
                <button onClick={() => navigate('/volunteer/nearby')} style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 600 }}>Full map →</button>
              </div>
              <div style={{ height: 280 }}>
                <MapView height="280px" sosRequests={nearbySos} userLat={lat} userLng={lng} showRadius radiusKm={20}
                  onSosClick={(sos) => navigate('/volunteer/nearby')} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
